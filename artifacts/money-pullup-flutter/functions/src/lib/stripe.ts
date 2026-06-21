import Stripe from "stripe";

let cached: Stripe | null = null;

/** Lazily-created Stripe client (server-side secret key only). */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  cached = new Stripe(key, { typescript: true, appInfo: { name: "money-pullup" } });
  return cached;
}

/** Money Pull Up commission, in cents, for a given tip amount. */
export function commissionCents(amountCents: number): number {
  const pct = Number(process.env.COMMISSION_PERCENT ?? "0.10");
  return Math.round(amountCents * pct);
}
