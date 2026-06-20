import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { getStripe, StripeNotConfiguredError } from "../lib/stripe";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CURRENCY = "eur";
const MIN_AMOUNT_EUR = 1;
const MAX_AMOUNT_EUR = 100000;

const accountId = z.string().startsWith("acct_").max(128);

const CreateAccountBody = z.object({
  djId: z.string().min(1).max(128),
  email: z.string().email().optional(),
});

const OnboardingBody = z.object({
  accountId,
  refreshUrl: z.string().url(),
  returnUrl: z.string().url(),
});

const PayoutBody = z.object({
  accountId,
  // Amount to pay out, in euros.
  amount: z.number().positive().min(MIN_AMOUNT_EUR).max(MAX_AMOUNT_EUR),
});

function handleStripeError(res: Response, err: unknown): void {
  if (err instanceof StripeNotConfiguredError) {
    res.status(503).json({ error: "stripe_not_configured", message: err.message });
    return;
  }
  logger.error({ err }, "Stripe Connect request failed");
  res.status(502).json({ error: "stripe_error", message: "Payment provider request failed." });
}

/**
 * Creates an Express connected account for a DJ. The returned `accountId` must
 * be stored and reused for onboarding and payouts.
 */
router.post("/connect/accounts", async (req: Request, res: Response) => {
  const parsed = CreateAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.create({
      type: "express",
      ...(parsed.data.email ? { email: parsed.data.email } : {}),
      capabilities: { transfers: { requested: true } },
      metadata: { dj_id: parsed.data.djId },
    });
    res.json({ accountId: account.id });
  } catch (err) {
    handleStripeError(res, err);
  }
});

/**
 * Creates a hosted onboarding link (KYC + bank details) for a connected
 * account. The client opens the URL; Stripe redirects back to `returnUrl`.
 */
router.post("/connect/onboarding-link", async (req: Request, res: Response) => {
  const parsed = OnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }

  try {
    const stripe = getStripe();
    const link = await stripe.accountLinks.create({
      account: parsed.data.accountId,
      refresh_url: parsed.data.refreshUrl,
      return_url: parsed.data.returnUrl,
      type: "account_onboarding",
    });
    res.json({ url: link.url });
  } catch (err) {
    handleStripeError(res, err);
  }
});

/**
 * Returns the onboarding/payout readiness of a connected account.
 */
router.get("/connect/accounts/:accountId", async (req: Request, res: Response) => {
  const id = req.params["accountId"];
  if (typeof id !== "string" || !id.startsWith("acct_")) {
    res.status(400).json({ error: "invalid_account_id" });
    return;
  }

  try {
    const stripe = getStripe();
    const account = await stripe.accounts.retrieve(id);
    res.json({
      detailsSubmitted: account.details_submitted ?? false,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
    });
  } catch (err) {
    handleStripeError(res, err);
  }
});

/**
 * Pays a DJ out: moves funds from the platform balance to the DJ's connected
 * account (which Stripe then pays out to their bank). The platform must hold
 * enough balance (funded by wallet top-ups / tips).
 */
router.post("/connect/payouts", async (req: Request, res: Response) => {
  const parsed = PayoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }

  const { accountId: destination, amount } = parsed.data;
  const amountInCents = Math.round(amount * 100);

  try {
    const stripe = getStripe();
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency: CURRENCY,
      destination,
      metadata: { type: "dj_payout" },
    });
    res.json({ transferId: transfer.id, amount });
  } catch (err) {
    handleStripeError(res, err);
  }
});

export default router;
