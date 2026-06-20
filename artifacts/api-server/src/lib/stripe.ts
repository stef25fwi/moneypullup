import Stripe from "stripe";

/**
 * Lazily-initialised Stripe client.
 *
 * The client is only constructed the first time a payment route needs it, so
 * the server (and its `/healthz` route) still boots in environments where the
 * Stripe keys are not configured. Payment routes return a clear 503 instead.
 */
let _stripe: Stripe | null = null;

export class StripeNotConfiguredError extends Error {
  readonly name = "StripeNotConfiguredError";
  constructor(missing: string) {
    super(`Stripe is not configured: ${missing} is missing.`);
  }
}

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env["STRIPE_SECRET_KEY"];
  if (!secretKey) {
    throw new StripeNotConfiguredError("STRIPE_SECRET_KEY");
  }

  // apiVersion is intentionally omitted so the SDK uses the account's default
  // pinned version, avoiding TS literal-version coupling on SDK upgrades.
  _stripe = new Stripe(secretKey, {
    typescript: true,
    appInfo: { name: "money-pullup" },
  });

  return _stripe;
}

export function getPublishableKey(): string | null {
  return process.env["STRIPE_PUBLISHABLE_KEY"] ?? null;
}

export function getWebhookSecret(): string {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret) {
    throw new StripeNotConfiguredError("STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}
