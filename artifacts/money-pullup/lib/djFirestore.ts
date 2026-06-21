import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";

export interface DjProfile {
  name?: string;
  isLive?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  autoMessage?: string;
  socialLinks?: { instagram?: string; tiktok?: string; facebook?: string };
  /** Public profile fields (DJ profile page). */
  avatarUrl?: string;
  city?: string;
  bio?: string;
  genres?: string[];
  verified?: boolean;
  /** Professional info. */
  proStatus?: string;
  siretVerified?: boolean;
  email?: string;
  phone?: string;
  ibanProvided?: boolean;
  /** Aggregate rating (maintained by Cloud Functions). */
  ratingAvg?: number;
  ratingCount?: number;
}

/** Live subscription to a single DJ profile document. */
export function subscribeDjProfile(
  djId: string,
  onProfile: (profile: DjProfile | null) => void,
): () => void {
  return onSnapshot(doc(firestore(), "djs", djId), (snap) =>
    onProfile(snap.exists() ? (snap.data() as DjProfile) : null),
  );
}

export interface DjProfileUpdate {
  name?: string;
  isLive?: boolean;
  socialLinks?: { instagram?: string; tiktok?: string; facebook?: string };
  autoMessage?: string;
  avatarUrl?: string;
  city?: string;
  bio?: string;
  genres?: string[];
}

/** Persists partial DJ profile fields to Firestore `djs/{djId}`. No-op when Firebase is not configured. */
export async function updateDjProfile(djId: string, fields: DjProfileUpdate): Promise<void> {
  if (!isFirebaseConfigured() || !djId) return;
  await setDoc(doc(firestore(), "djs", djId), fields, { merge: true });
}
