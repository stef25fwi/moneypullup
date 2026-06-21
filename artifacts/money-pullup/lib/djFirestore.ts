import { doc, setDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";

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
