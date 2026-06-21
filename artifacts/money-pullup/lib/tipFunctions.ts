import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/lib/firebase";

export interface TipIntent {
  tipId: string;
  clientSecret: string;
}

export interface AccountStatus {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

function call<T, R>(name: string, payload: T): Promise<R> {
  const fn = httpsCallable<T, R>(firebaseFunctions(), name);
  return fn(payload).then((res) => res.data);
}

export function createTipPaymentIntent(args: {
  djId: string;
  amountCents: number;
  message: string;
}): Promise<TipIntent> {
  return call<typeof args, TipIntent>("createTipPaymentIntent", args);
}

export function confirmTip(tipId: string): Promise<{ status: string }> {
  return call<{ tipId: string }, { status: string }>("confirmTip", { tipId });
}

export function acceptTip(tipId: string): Promise<{ status: string }> {
  return call<{ tipId: string }, { status: string }>("acceptTip", { tipId });
}

export function refuseTip(tipId: string): Promise<{ status: string }> {
  return call<{ tipId: string }, { status: string }>("refuseTip", { tipId });
}

export function createDjConnectAccount(djId: string): Promise<{ accountId: string }> {
  return call<{ djId: string }, { accountId: string }>("createDjConnectAccount", { djId });
}

export function createDjOnboardingLink(args: {
  djId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  return call<typeof args, { url: string }>("createDjOnboardingLink", args);
}

export function getDjAccountStatus(djId: string): Promise<AccountStatus> {
  return call<{ djId: string }, AccountStatus>("getDjAccountStatus", { djId });
}
