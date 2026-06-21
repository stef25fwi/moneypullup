import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { notifyUser } from "./lib/notify";

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
 * A client requests to book a DJ for an event. Creates a `bookings/{id}`
 * document with status `pending` and notifies the DJ owner.
 */
export const createBooking = onCall(async (req) => {
  const uid = requireUid(req);
  const djId = str(req.data?.djId);
  const eventDate = str(req.data?.eventDate); // ISO date (YYYY-MM-DD)
  const eventType = str(req.data?.eventType).slice(0, 80);
  const location = str(req.data?.location).slice(0, 160);
  const message = str(req.data?.message).slice(0, 800);
  const clientName = str(req.data?.clientName).slice(0, 80) || str(req.auth?.token.name) || "Client";
  const clientEmail = str(req.data?.clientEmail).slice(0, 160);
  const clientPhone = str(req.data?.clientPhone).slice(0, 40);

  if (!djId) throw new HttpsError("invalid-argument", "djId is required.");
  if (!eventDate) throw new HttpsError("invalid-argument", "eventDate is required.");

  const djSnap = await db().collection("djs").doc(djId).get();
  const dj = djSnap.data();
  if (!djSnap.exists || !dj) throw new HttpsError("not-found", "Unknown DJ.");

  const ref = db().collection("bookings").doc();
  const now = admin.firestore.FieldValue.serverTimestamp();
  await ref.set({
    djId,
    djOwnerUid: dj.ownerUid ?? null,
    djName: dj.name ?? "",
    clientUid: uid,
    clientName,
    clientEmail,
    clientPhone,
    eventDate,
    eventType,
    location,
    message,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  if (dj.ownerUid) {
    await notifyUser(
      dj.ownerUid,
      "📅 Nouvelle demande de réservation",
      `${clientName} souhaite vous réserver le ${eventDate}${eventType ? ` (${eventType})` : ""}.`,
    );
  }

  return { bookingId: ref.id, status: "pending" };
});

/**
 * The DJ owner responds to a booking request: `accept` or `decline`.
 * Updates the status and notifies the client.
 */
export const respondBooking = onCall(async (req) => {
  const uid = requireUid(req);
  const bookingId = str(req.data?.bookingId);
  const action = str(req.data?.action); // "accept" | "decline"
  if (!bookingId) throw new HttpsError("invalid-argument", "bookingId is required.");
  if (action !== "accept" && action !== "decline") {
    throw new HttpsError("invalid-argument", "action must be 'accept' or 'decline'.");
  }

  const ref = db().collection("bookings").doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Unknown booking.");
  const booking = snap.data() as FirebaseFirestore.DocumentData;
  if (booking.djOwnerUid !== uid) {
    throw new HttpsError("permission-denied", "Only the DJ can respond to this booking.");
  }
  if (booking.status !== "pending") return { status: booking.status };

  const status = action === "accept" ? "accepted" : "declined";
  await ref.set(
    { status, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );

  if (booking.clientUid) {
    await notifyUser(
      booking.clientUid,
      status === "accepted" ? "✅ Réservation acceptée" : "❌ Réservation refusée",
      status === "accepted"
        ? `${booking.djName || "Le DJ"} a accepté votre réservation du ${booking.eventDate}.`
        : `${booking.djName || "Le DJ"} n'est pas disponible le ${booking.eventDate}.`,
    );
  }

  return { status };
});

/**
 * The client cancels their own pending/accepted booking.
 */
export const cancelBooking = onCall(async (req) => {
  const uid = requireUid(req);
  const bookingId = str(req.data?.bookingId);
  if (!bookingId) throw new HttpsError("invalid-argument", "bookingId is required.");

  const ref = db().collection("bookings").doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Unknown booking.");
  const booking = snap.data() as FirebaseFirestore.DocumentData;
  if (booking.clientUid !== uid) {
    throw new HttpsError("permission-denied", "Not your booking.");
  }
  if (booking.status === "cancelled") return { status: "cancelled" };

  await ref.set(
    { status: "cancelled", updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true },
  );

  if (booking.djOwnerUid) {
    await notifyUser(
      booking.djOwnerUid,
      "🚫 Réservation annulée",
      `${booking.clientName || "Un client"} a annulé sa réservation du ${booking.eventDate}.`,
    );
  }

  return { status: "cancelled" };
});
