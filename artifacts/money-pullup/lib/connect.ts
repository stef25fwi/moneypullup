import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { API_BASE_URL, isApiConfigured } from "@/constants/config";
import { PaymentConfigError } from "@/lib/payments";

export interface AccountStatus {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

export type OnboardingResult = "returned" | "dismissed";

function ensureConfigured(): void {
  if (!isApiConfigured()) {
    throw new PaymentConfigError(
      "EXPO_PUBLIC_API_URL is not set — cannot reach the payment server.",
    );
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  ensureConfigured();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request to ${path} failed (HTTP ${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

/** Creates an Express connected account for a DJ and returns its id. */
export async function createConnectedAccount(djId: string): Promise<string> {
  const data = await postJson<{ accountId: string }>("/api/connect/accounts", { djId });
  if (!data.accountId) throw new Error("No accountId returned.");
  return data.accountId;
}

/** Fetches the onboarding/payout readiness of a connected account. */
export async function getAccountStatus(accountId: string): Promise<AccountStatus> {
  ensureConfigured();
  const res = await fetch(`${API_BASE_URL}/api/connect/accounts/${accountId}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Status fetch failed (HTTP ${res.status}): ${text}`);
  }
  return (await res.json()) as AccountStatus;
}

/**
 * Opens Stripe's hosted onboarding (KYC + bank details) for the connected
 * account and resolves once the user returns to the app. The caller should
 * re-fetch the account status afterwards to reflect the new state.
 */
export async function startOnboarding(accountId: string): Promise<OnboardingResult> {
  const returnUrl = Linking.createURL("dj/connect");
  const { url } = await postJson<{ url: string }>("/api/connect/onboarding-link", {
    accountId,
    refreshUrl: returnUrl,
    returnUrl,
  });

  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.location.assign(url);
    return "dismissed";
  }

  const result = await WebBrowser.openAuthSessionAsync(url, returnUrl);
  return result.type === "success" ? "returned" : "dismissed";
}

/**
 * Pays a DJ out from the platform balance to their connected account.
 * Returns the Stripe transfer id.
 */
export async function requestPayout(
  accountId: string,
  amount: number,
  djId?: string,
): Promise<string> {
  const data = await postJson<{ transferId: string }>("/api/connect/payouts", {
    accountId,
    amount,
    ...(djId ? { djId } : {}),
  });
  return data.transferId;
}
