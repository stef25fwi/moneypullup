import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { firestore, isFirebaseConfigured } from "@/lib/firebase";

export type AccountRole = "fan" | "dj";

export interface FanProfile {
  /** Account-level role chosen after login; persisted so it survives reloads. */
  role?: AccountRole;
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  /** Legal / consent state. */
  cguAcceptedAt?: { toDate?: () => Date } | null;
  cguVersion?: string;
  marketingOptIn?: boolean;
}

export interface FanProfileUpdate {
  role?: AccountRole;
  name?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  cguVersion?: string;
  marketingOptIn?: boolean;
}

/** Live subscription to the fan's own profile document (`users/{uid}`). */
export function subscribeFanProfile(
  uid: string,
  onProfile: (profile: FanProfile | null) => void,
): () => void {
  return onSnapshot(doc(firestore(), "users", uid), (snap) =>
    onProfile(snap.exists() ? (snap.data() as FanProfile) : null),
  );
}

/** Persists partial fan profile fields. No-op when Firebase is not configured. */
export async function updateFanProfile(uid: string, fields: FanProfileUpdate): Promise<void> {
  if (!isFirebaseConfigured() || !uid) return;
  await setDoc(doc(firestore(), "users", uid), fields, { merge: true });
}

/** Records acceptance of a given CGU version with a server timestamp. */
export async function acceptCgu(uid: string, version: string): Promise<void> {
  if (!isFirebaseConfigured() || !uid) return;
  await setDoc(
    doc(firestore(), "users", uid),
    { cguVersion: version, cguAcceptedAt: serverTimestamp() },
    { merge: true },
  );
}
