import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import type Stripe from "stripe";
import { getStripe } from "./lib/stripe";

const STATUS_BY_EVENT: Record<string, string> = {
  "payment_intent.succeeded": "captured",
  "payment_intent.canceled": "cancelled",
  "payment_intent.amount_capturable_updated": "requires_capture",
  "payment_intent.payment_failed": "failed",
};

/**
 * Keeps tip documents in sync with Stripe in case a capture/cancel happens
 * outside the app (or a callable response is lost). Signature-verified.
 */
export const stripeWebhook = onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || typeof signature !== "string") {
    res.status(400).send("missing signature");
    return;
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(req.rawBody, signature, secret);
  } catch {
    res.status(400).send("invalid signature");
    return;
  }

  const status = STATUS_BY_EVENT[event.type];
  if (status) {
    const pi = event.data.object as Stripe.PaymentIntent;
    const tipId = pi.metadata?.tipId;
    if (tipId) {
      await admin
        .firestore()
        .collection("tips")
        .doc(tipId)
        .set(
          { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true },
        );
    }
  }

  res.json({ received: true });
});
