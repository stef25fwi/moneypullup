import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

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
 * A fan submits (or updates) their review of a DJ. One review per fan per DJ
 * (document id is `${djId}_${fanUid}`), so re-submitting overwrites. The DJ's
 * aggregate rating (ratingAvg / ratingCount) is recomputed transactionally.
 */
export const submitReview = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = str(req.data?.djId);
  const rating = Math.round(Number(req.data?.rating ?? 0));
  const comment = str(req.data?.comment).slice(0, 500);
  const fanName = str(req.auth?.token.name) || str(req.data?.fanName) || "Fan";

  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpsError("invalid-argument", "Rating must be between 1 and 5.");
  }

  const djRef = db().collection("djs").doc(djId);
  const reviewRef = db().collection("reviews").doc(`${djId}_${uid}`);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db().runTransaction(async (tx) => {
    const djSnap = await tx.get(djRef);
    if (!djSnap.exists) throw new HttpsError("not-found", "Unknown DJ.");
    const dj = djSnap.data() ?? {};

    const prevSnap = await tx.get(reviewRef);
    const prevRating = prevSnap.exists ? Number(prevSnap.data()?.rating ?? 0) : 0;

    const count = Number(dj.ratingCount ?? 0);
    const sum = Number(dj.ratingSum ?? 0);
    const newCount = prevSnap.exists ? count : count + 1;
    const newSum = sum - prevRating + rating;
    const newAvg = newCount > 0 ? Math.round((newSum / newCount) * 10) / 10 : 0;

    tx.set(
      reviewRef,
      {
        djId,
        djOwnerUid: dj.ownerUid ?? null,
        fanUid: uid,
        fanName,
        rating,
        comment,
        updatedAt: now,
        ...(prevSnap.exists ? {} : { createdAt: now }),
      },
      { merge: true },
    );

    tx.set(djRef, { ratingCount: newCount, ratingSum: newSum, ratingAvg: newAvg }, { merge: true });
  });

  return { ok: true };
});
