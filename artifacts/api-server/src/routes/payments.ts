import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import type Stripe from "stripe";
import {
  getPublishableKey,
  getStripe,
  getWebhookSecret,
  StripeNotConfiguredError,
} from "../lib/stripe";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CURRENCY = "eur";
const MIN_AMOUNT_EUR = 1;
const MAX_AMOUNT_EUR = 1000;

const CheckoutBody = z.object({
  // Amount to top up, expressed in euros (e.g. 20 or 12.5).
  amount: z
    .number()
    .positive()
    .min(MIN_AMOUNT_EUR)
    .max(MAX_AMOUNT_EUR),
  // Deep links the hosted Checkout page redirects back to.
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  // Opaque identifier for the wallet being credited (used by the webhook).
  walletId: z.string().min(1).max(128).optional(),
});

function handleStripeError(res: Response, err: unknown): void {
  if (err instanceof StripeNotConfiguredError) {
    res.status(503).json({ error: "stripe_not_configured", message: err.message });
    return;
  }
  logger.error({ err }, "Stripe request failed");
  res.status(502).json({ error: "stripe_error", message: "Payment provider request failed." });
}

/**
 * Returns the publishable key so the client can be configured without
 * hard-coding it into the bundle.
 */
router.get("/payments/config", (_req: Request, res: Response) => {
  res.json({ publishableKey: getPublishableKey() });
});

/**
 * Creates a Stripe Checkout Session for a wallet top-up and returns the hosted
 * payment page URL. The client opens it (in-app browser on native, redirect on
 * web); the wallet is credited server-side by the webhook below.
 */
router.post("/payments/checkout", async (req: Request, res: Response) => {
  const parsed = CheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }

  const { amount, successUrl, cancelUrl, walletId } = parsed.data;
  const amountInCents = Math.round(amount * 100);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amountInCents,
            product_data: {
              name: "Recharge du portefeuille Money Pull-up",
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "wallet_topup",
        amount_cents: String(amountInCents),
        ...(walletId ? { wallet_id: walletId } : {}),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    handleStripeError(res, err);
  }
});

/**
 * Stripe webhook endpoint. Mounted with a raw body parser in `app.ts` so the
 * signature can be verified. This is the source of truth for crediting wallets.
 */
router.post("/payments/webhook", (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    res.status(400).json({ error: "missing_signature" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    // req.body is a Buffer here thanks to express.raw() in app.ts.
    event = stripe.webhooks.constructEvent(req.body, signature, getWebhookSecret());
  } catch (err) {
    logger.warn({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const amountCents = Number(session.metadata?.["amount_cents"] ?? session.amount_total ?? 0);
    const walletId = session.metadata?.["wallet_id"];
    logger.info(
      { sessionId: session.id, amountCents, walletId },
      "Wallet top-up paid — credit the wallet here",
    );
    // TODO: persist the credit to the wallet (e.g. via @workspace/db) using
    // walletId + amountCents. Kept side-effect-free until a server-side wallet
    // model exists; the app currently mirrors the balance optimistically.
  }

  res.json({ received: true });
});

export default router;
