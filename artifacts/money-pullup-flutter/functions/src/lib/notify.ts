import * as admin from "firebase-admin";

/**
 * Sends an Expo push notification to a user if they have a registered token at
 * `users/{uid}.expoPushToken`. Non-fatal — failures are swallowed so they never
 * block the calling operation.
 */
export async function notifyUser(uid: string, title: string, body: string): Promise<void> {
  if (!uid) return;
  try {
    const snap = await admin.firestore().collection("users").doc(uid).get();
    const token = snap.data()?.expoPushToken;
    if (!token || typeof token !== "string") return;

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ to: token, title, body, sound: "default" }),
    });
  } catch {
    // Non-fatal
  }
}
