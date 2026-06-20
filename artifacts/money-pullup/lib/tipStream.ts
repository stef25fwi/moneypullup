import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { firestore } from "@/lib/firebase";

export type RemoteTipStatus = "pending" | "accepted" | "refused";

export interface StreamTip {
  id: string;
  fanName: string;
  amount: number; // euros
  message: string;
  djId: string;
  status: RemoteTipStatus;
  createdAt: Date;
}

function mapStatus(status: unknown): RemoteTipStatus {
  if (status === "captured") return "accepted";
  if (status === "cancelled" || status === "failed") return "refused";
  return "pending";
}

function toTip(doc: QueryDocumentSnapshot<DocumentData>): StreamTip {
  const d = doc.data();
  const cents = typeof d.amountCents === "number" ? d.amountCents : 0;
  return {
    id: doc.id,
    fanName: typeof d.fanName === "string" ? d.fanName : "Fan",
    amount: Math.floor(cents / 100),
    message: typeof d.message === "string" ? d.message : "",
    djId: typeof d.djId === "string" ? d.djId : "",
    status: mapStatus(d.status),
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
  };
}

/**
 * Subscribes to the pending tips addressed to a DJ (live dashboard).
 * Returns an unsubscribe function.
 */
export function subscribePendingTipsForDj(
  djOwnerUid: string,
  onTips: (tips: StreamTip[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(firestore(), "tips"),
    where("djOwnerUid", "==", djOwnerUid),
    where("status", "==", "requires_capture"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => onTips(snap.docs.map(toTip)),
    (err) => onError?.(err),
  );
}
