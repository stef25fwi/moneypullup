import { httpsCallable } from "firebase/functions";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firebaseFunctions, firestore } from "@/lib/firebase";

export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface Booking {
  id: string;
  djId: string;
  djName: string;
  clientUid: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  eventType: string;
  location: string;
  message: string;
  status: BookingStatus;
  createdAt: Date;
}

export interface BookingInput {
  djId: string;
  eventDate: string;
  eventType?: string;
  location?: string;
  message?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

function call<T, R>(name: string, payload: T): Promise<R> {
  const fn = httpsCallable<T, R>(firebaseFunctions(), name);
  return fn(payload).then((r) => r.data);
}

export function createBooking(input: BookingInput): Promise<{ bookingId: string; status: string }> {
  return call("createBooking", input);
}

export function respondBooking(
  bookingId: string,
  action: "accept" | "decline",
): Promise<{ status: string }> {
  return call("respondBooking", { bookingId, action });
}

export function cancelBooking(bookingId: string): Promise<{ status: string }> {
  return call("cancelBooking", { bookingId });
}

function toBooking(doc: QueryDocumentSnapshot<DocumentData>): Booking {
  const d = doc.data();
  return {
    id: doc.id,
    djId: typeof d.djId === "string" ? d.djId : "",
    djName: typeof d.djName === "string" ? d.djName : "",
    clientUid: typeof d.clientUid === "string" ? d.clientUid : "",
    clientName: typeof d.clientName === "string" ? d.clientName : "Client",
    clientEmail: typeof d.clientEmail === "string" ? d.clientEmail : "",
    clientPhone: typeof d.clientPhone === "string" ? d.clientPhone : "",
    eventDate: typeof d.eventDate === "string" ? d.eventDate : "",
    eventType: typeof d.eventType === "string" ? d.eventType : "",
    location: typeof d.location === "string" ? d.location : "",
    message: typeof d.message === "string" ? d.message : "",
    status: (typeof d.status === "string" ? d.status : "pending") as BookingStatus,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
  };
}

/** Bookings addressed to a DJ owner (management view). Returns unsubscribe. */
export function subscribeDjBookings(
  djOwnerUid: string,
  onBookings: (b: Booking[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    collection(firestore(), "bookings"),
    where("djOwnerUid", "==", djOwnerUid),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => onBookings(snap.docs.map(toBooking)),
    (err) => onError?.(err),
  );
}

/** Bookings created by a client (their own requests). Returns unsubscribe. */
export function subscribeClientBookings(
  clientUid: string,
  onBookings: (b: Booking[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    collection(firestore(), "bookings"),
    where("clientUid", "==", clientUid),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => onBookings(snap.docs.map(toBooking)),
    (err) => onError?.(err),
  );
}
