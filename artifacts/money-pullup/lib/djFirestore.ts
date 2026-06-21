import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";

export interface DjProfile {
  name?: string;
  isLive?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  autoMessage?: string;
  socialLinks?: { instagram?: string; tiktok?: string; facebook?: string };
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
}

/** Persists partial DJ profile fields to Firestore `djs/{djId}`. No-op when Firebase is not configured. */
export async function updateDjProfile(djId: string, fields: DjProfileUpdate): Promise<void> {
  if (!isFirebaseConfigured() || !djId) return;
  await setDoc(doc(firestore(), "djs", djId), fields, { merge: true });
}
