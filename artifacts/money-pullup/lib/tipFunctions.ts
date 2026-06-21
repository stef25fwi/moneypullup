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

export interface TipStatement {
  statementId: string;
  documentNumber: string;
  format: "pdf" | "csv";
  downloadUrl: string;
  tipCount: number;
  brutCents: number;
  fraisCents: number;
  netCents: number;
}

export function generateTipStatement(args: {
  djId: string;
  format: "pdf" | "csv";
  from?: string;
  to?: string;
}): Promise<TipStatement> {
  return call<typeof args, TipStatement>("generateTipStatement", args);
}

export interface FanStatement {
  statementId: string;
  documentNumber: string;
  format: "pdf" | "csv";
  downloadUrl: string;
  tipCount: number;
  totalCents: number;
}

export function generateFanStatement(args: {
  format: "pdf" | "csv";
  from?: string;
  to?: string;
}): Promise<FanStatement> {
  return call<typeof args, FanStatement>("generateFanStatement", args);
}
