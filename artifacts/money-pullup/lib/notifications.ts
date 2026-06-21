import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { doc, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

import { firestore, isFirebaseConfigured } from "@/lib/firebase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests push permission, retrieves the Expo push token, and stores it at
 * `users/{uid}.expoPushToken` so Cloud Functions can notify this device.
 * Non-fatal — the app works without notifications.
 */
export async function registerPushToken(uid: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  if (Platform.OS === "web") return;

  try {
    const perms = await Notifications.requestPermissionsAsync();
    // expo-notifications type mismatch with expo@54 — cast to check status at runtime
    if ((perms as unknown as { status: string }).status !== "granted") return;

    const projectId =
      (Constants.expoConfig?.extra as Record<string, any>)?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    await setDoc(doc(firestore(), "users", uid), { expoPushToken }, { merge: true });
  } catch {
    // Non-fatal: notifications unavailable (simulator, permissions denied, etc.)
  }
}
