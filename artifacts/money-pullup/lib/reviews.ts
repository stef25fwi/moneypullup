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

export interface Review {
  id: string;
  djId: string;
  fanUid: string;
  fanName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function submitReview(args: {
  djId: string;
  rating: number;
  comment?: string;
  fanName?: string;
}): Promise<{ ok: boolean }> {
  const fn = httpsCallable<typeof args, { ok: boolean }>(firebaseFunctions(), "submitReview");
  return fn(args).then((r) => r.data);
}

function toReview(doc: QueryDocumentSnapshot<DocumentData>): Review {
  const d = doc.data();
  return {
    id: doc.id,
    djId: typeof d.djId === "string" ? d.djId : "",
    fanUid: typeof d.fanUid === "string" ? d.fanUid : "",
    fanName: typeof d.fanName === "string" ? d.fanName : "Fan",
    rating: typeof d.rating === "number" ? d.rating : 0,
    comment: typeof d.comment === "string" ? d.comment : "",
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
  };
}

/** Live subscription to a DJ's reviews, newest first. Returns unsubscribe. */
export function subscribeDjReviews(
  djId: string,
  onReviews: (reviews: Review[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(
    collection(firestore(), "reviews"),
    where("djId", "==", djId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(
    q,
    (snap) => onReviews(snap.docs.map(toReview)),
    (err) => onError?.(err),
  );
}
