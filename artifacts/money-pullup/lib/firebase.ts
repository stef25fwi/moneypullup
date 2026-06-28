import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFunctions, type Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const FUNCTIONS_REGION = "europe-west1";

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

let app: FirebaseApp | null = null;
function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function firestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function firebaseFunctions(): Functions {
  return getFunctions(getFirebaseApp(), FUNCTIONS_REGION);
}

/** Ensures an (anonymous) session and returns the uid, or null if unconfigured. */
export async function ensureSignedIn(): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  const auth = firebaseAuth();
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
  return auth.currentUser?.uid ?? null;
}

export function currentUid(): string | null {
  if (!isFirebaseConfigured()) return null;
  return firebaseAuth().currentUser?.uid ?? null;
}

export async function signInWithEmail(email: string, password: string): Promise<string> {
  const cred = await signInWithEmailAndPassword(firebaseAuth(), email, password);
  return cred.user.uid;
}

export async function signUpWithEmail(email: string, password: string): Promise<string> {
  const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
  return cred.user.uid;
}

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth());
}
