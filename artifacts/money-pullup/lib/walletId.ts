import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@moneypullup/walletId";

let cached: string | null = null;

/**
 * Returns a stable, device-local wallet identifier, generating and persisting
 * one on first use. It is sent to the backend so Stripe webhooks can credit the
 * authoritative (server-side) wallet ledger for this device.
 */
export async function getWalletId(): Promise<string> {
  if (cached) return cached;
  let id = await AsyncStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    await AsyncStorage.setItem(STORAGE_KEY, id);
  }
  cached = id;
  return id;
}
