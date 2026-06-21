import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { commissionCents, getStripe } from "./lib/stripe";

const db = () => admin.firestore();

const MIN_CENTS = 100; // 1 €
const MAX_CENTS = 50000; // 500 €

/**
 * Sends an Expo push notification to the fan if they have registered a token.
 * Non-fatal — failures are swallowed so they never block a capture/cancel.
 */
async function notifyFan(fanUid: string, title: string, body: string): Promise<void> {
  try {
    const snap = await db().collection("users").doc(fanUid).get();
    const token = snap.data()?.expoPushToken;
    if (!token || typeof token !== "string") return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ to: token, title, body, sound: "default" }),
    });
  } catch {
    // Non-fatal
  }
}

function requireUid(req: CallableRequest): string {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  return uid;
}

/**
 * Step 3 of the flow: create a manual-capture PaymentIntent for a tip.
 * The funds are authorised (held) but not captured; the tip document is created
 * with status `requires_capture`. Returns the clientSecret for the Payment Sheet.
 */
export const createTipPaymentIntent = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = typeof req.data?.djId === "string" ? req.data.djId : "";
  const amountCents = Number(req.data?.amountCents ?? 0);
  const message = (typeof req.data?.message === "string" ? req.data.message : "").slice(0, 500);

  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");
  if (!Number.isInteger(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    throw new HttpsError("invalid-argument", "Amount must be between 1 and 500 €.");
  }

  const djSnap = await db().collection("djs").doc(djId).get();
  const dj = djSnap.data();
  if (!djSnap.exists || !dj?.stripeAccountId) {
    throw new HttpsError("failed-precondition", "This DJ cannot receive tips yet.");
  }
  if (!dj.chargesEnabled || !dj.payoutsEnabled) {
    throw new HttpsError("failed-precondition", "This DJ has not finished Stripe onboarding.");
  }

  const fee = commissionCents(amountCents);
  const tipRef = db().collection("tips").doc();

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    capture_method: "manual",
    application_fee_amount: fee,
    transfer_data: { destination: dj.stripeAccountId },
    metadata: { tipId: tipRef.id, djId, fanUid: uid },
  });

  const now = admin.firestore.FieldValue.serverTimestamp();
  await tipRef.set({
    fanUid: uid,
    fanName: (req.auth?.token.name as string | undefined) ?? "Fan",
    djId,
    djName: dj.name ?? "",
    djOwnerUid: dj.ownerUid ?? null,
    amountCents,
    applicationFeeCents: fee,
    currency: "eur",
    message,
    status: "awaiting_payment",
    stripePaymentIntentId: paymentIntent.id,
    createdAt: now,
    updatedAt: now,
  });

  return { tipId: tipRef.id, clientSecret: paymentIntent.client_secret };
});

/**
 * Called by the fan right after the Payment Sheet succeeds. Verifies with Stripe
 * that the PaymentIntent is authorised (requires_capture) and only then makes the
 * tip visible to the DJ. The webhook does the same as a backstop, so the DJ sees
 * the tip the instant payment is authorised — never before.
 */
export const confirmTip = onCall(async (req) => {
  const uid = requireUid(req);
  const tipId = typeof req.data?.tipId === "string" ? req.data.tipId : "";
  if (!tipId) throw new HttpsError("invalid-argument", "tipId is required.");

  const ref = db().collection("tips").doc(tipId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Unknown tip.");
  const tip = snap.data() as FirebaseFirestore.DocumentData;
  if (tip.fanUid !== uid) throw new HttpsError("permission-denied", "Not your tip.");
  if (tip.status === "requires_capture" || tip.status === "captured") {
    return { status: tip.status };
  }

  const pi = await getStripe().paymentIntents.retrieve(tip.stripePaymentIntentId);
  if (pi.status === "requires_capture") {
    await ref.set(
      { status: "requires_capture", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true },
    );
    return { status: "requires_capture" };
  }
  return { status: tip.status };
});

async function loadOwnedTip(tipId: string, uid: string) {
  if (!tipId) throw new HttpsError("invalid-argument", "tipId is required.");
  const ref = db().collection("tips").doc(tipId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Unknown tip.");
  const tip = snap.data() as FirebaseFirestore.DocumentData;
  if (tip.djOwnerUid !== uid) {
    throw new HttpsError("permission-denied", "Only the DJ can decide on this tip.");
  }
  return { ref, tip };
}

/** Step 6A: the DJ accepts → capture the held funds. Idempotent. */
export const acceptTip = onCall(async (req) => {
  const uid = requireUid(req);
  const tipId = typeof req.data?.tipId === "string" ? req.data.tipId : "";
  const { ref, tip } = await loadOwnedTip(tipId, uid);
  if (tip.status !== "requires_capture") return { status: tip.status };

  await getStripe().paymentIntents.capture(tip.stripePaymentIntentId);

  // Fetch the DJ's auto-message to attach to the captured tip.
  const djSnap = await db().collection("djs").doc(tip.djId).get();
  const autoMessage = (djSnap.data()?.autoMessage as string | undefined) ?? "";

  await ref.set(
    {
      status: "captured",
      acceptedByDj: true,
      djAutoMessage: autoMessage || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  const amountEur = (tip.amountCents / 100).toFixed(0);
  const msg = autoMessage ? `"${autoMessage}"` : "Merci pour votre soutien ! 🎧";
  await notifyFan(
    tip.fanUid,
    `💚 Tip accepté — ${amountEur}€`,
    `${tip.djName || "Le DJ"} a accepté votre tip. ${msg}`,
  );

  return { status: "captured", djAutoMessage: autoMessage };
});

/** Step 6B: the DJ refuses → cancel the authorisation. The fan is never charged. */
export const refuseTip = onCall(async (req) => {
  const uid = requireUid(req);
  const tipId = typeof req.data?.tipId === "string" ? req.data.tipId : "";
  const { ref, tip } = await loadOwnedTip(tipId, uid);
  if (tip.status !== "requires_capture") return { status: tip.status };

  await getStripe().paymentIntents.cancel(tip.stripePaymentIntentId);
  await ref.set(
    { status: "cancelled", refusedByDj: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );

  const amountEur = (tip.amountCents / 100).toFixed(0);
  await notifyFan(
    tip.fanUid,
    `❌ Tip refusé — ${amountEur}€`,
    `${tip.djName || "Le DJ"} n'a pas accepté votre tip. Vous n'avez pas été débité.`,
  );

  return { status: "cancelled" };
});
