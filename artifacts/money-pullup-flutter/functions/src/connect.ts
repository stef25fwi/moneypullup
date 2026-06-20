import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { getStripe } from "./lib/stripe";

const db = () => admin.firestore();

function requireUid(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  return uid;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Creates (once) a Stripe Express connected account for a DJ and stores its id
 * on the DJ document. The caller becomes/owns the DJ profile.
 */
export const createDjConnectAccount = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = str(req.data?.djId);
  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");

  const ref = db().collection("djs").doc(djId);
  const snap = await ref.get();
  const data = snap.data() ?? {};
  if (snap.exists && data.ownerUid && data.ownerUid !== uid) {
    throw new HttpsError("permission-denied", "This DJ profile belongs to another user.");
  }

  let accountId: string | undefined = data.stripeAccountId;
  if (!accountId) {
    const account = await getStripe().accounts.create({
      type: "express",
      email: req.auth?.token.email,
      capabilities: { transfers: { requested: true } },
      metadata: { dj_id: djId },
    });
    accountId = account.id;
  }

  await ref.set(
    { ownerUid: uid, stripeAccountId: accountId, name: data.name ?? str(req.data?.name) },
    { merge: true },
  );
  return { accountId };
});

/** Hosted onboarding link (KYC + bank details) for the DJ's connected account. */
export const createDjOnboardingLink = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = str(req.data?.djId);
  const refreshUrl = str(req.data?.refreshUrl);
  const returnUrl = str(req.data?.returnUrl);
  if (!djId || !refreshUrl || !returnUrl) {
    throw new HttpsError("invalid-argument", "djId, refreshUrl and returnUrl are required.");
  }

  const snap = await db().collection("djs").doc(djId).get();
  const data = snap.data();
  if (!data?.stripeAccountId) throw new HttpsError("failed-precondition", "No Stripe account.");
  if (data.ownerUid !== uid) throw new HttpsError("permission-denied", "Not your DJ profile.");

  const link = await getStripe().accountLinks.create({
    account: data.stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return { url: link.url };
});

/** Refreshes and persists the DJ's payout readiness from Stripe. */
export const getDjAccountStatus = onCall(async (req) => {
  requireUid(req);
  const djId = str(req.data?.djId);
  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");

  const snap = await db().collection("djs").doc(djId).get();
  const data = snap.data();
  if (!data?.stripeAccountId) throw new HttpsError("failed-precondition", "No Stripe account.");

  const account = await getStripe().accounts.retrieve(data.stripeAccountId);
  const status = {
    detailsSubmitted: account.details_submitted ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
  };
  await db().collection("djs").doc(djId).set(status, { merge: true });
  return status;
});
