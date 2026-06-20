/**
 * Runtime configuration for the app.
 *
 * `EXPO_PUBLIC_API_URL` must point at the deployed api-server (e.g.
 * `https://your-api.example.com`). It is read at build time by Expo and
 * embedded in the bundle. The trailing slash, if any, is stripped.
 */
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

/** App deep-link scheme, mirrors `scheme` in app.json. */
export const APP_SCHEME = "money-pullup";

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}
