import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { API_BASE_URL, isApiConfigured } from "@/constants/config";

export type TopUpResult = "success" | "cancelled" | "dismissed";

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export class PaymentConfigError extends Error {
  readonly name = "PaymentConfigError";
}

/**
 * Asks the backend to create a Stripe Checkout Session for a wallet top-up and
 * returns the hosted payment page URL plus the redirect targets used to bring
 * the user back into the app.
 */
async function createCheckoutSession(
  amount: number,
): Promise<{ url: string; returnUrl: string }> {
  if (!isApiConfigured()) {
    throw new PaymentConfigError(
      "EXPO_PUBLIC_API_URL is not set — cannot reach the payment server.",
    );
  }

  // Deep links Stripe redirects to once the payment is finished/cancelled.
  // Both share the same base path so a single `returnUrl` closes the in-app
  // browser; the `status` query tells us which outcome occurred.
  const returnUrl = Linking.createURL("wallet/topup");
  const successUrl = Linking.createURL("wallet/topup", { queryParams: { status: "success" } });
  const cancelUrl = Linking.createURL("wallet/topup", { queryParams: { status: "cancel" } });

  const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount, successUrl, cancelUrl }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Checkout creation failed (HTTP ${res.status}): ${text}`);
  }

  const data = (await res.json()) as CheckoutSessionResponse;
  if (!data.url) throw new Error("Checkout session did not return a URL.");

  return { url: data.url, returnUrl };
}

/**
 * Runs the full wallet top-up flow:
 *  - native: opens the Stripe Checkout page in an in-app browser and resolves
 *    once the user returns to the app.
 *  - web: redirects the tab to the Checkout page (resolves to "dismissed"
 *    because the page navigates away).
 *
 * The wallet is credited server-side by the Stripe webhook; the caller may
 * optimistically reflect the new balance on a "success" result.
 */
export async function startWalletTopUp(amount: number): Promise<TopUpResult> {
  const { url, returnUrl } = await createCheckoutSession(amount);

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.location.assign(url);
    }
    return "dismissed";
  }

  const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);

  if (result.type === "success") {
    const status = new URL(result.url).searchParams.get("status");
    return status === "cancel" ? "cancelled" : "success";
  }
  if (result.type === "cancel") return "cancelled";
  return "dismissed";
}
