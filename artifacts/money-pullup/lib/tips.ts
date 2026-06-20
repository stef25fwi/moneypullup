import { API_BASE_URL, isApiConfigured } from "@/constants/config";
import { getWalletId } from "@/lib/walletId";

export type RemoteTipStatus = "pending" | "accepted" | "refused";

export interface RemoteTip {
  id: string;
  amount: number; // euros
  fromName: string;
  message: string;
  timestamp: string; // ISO
  djId: string;
  djName: string;
  status: RemoteTipStatus;
}

interface ServerTip {
  id: string;
  fanName: string;
  message: string;
  createdAt: string;
  djId: string;
  djName: string;
  amountCents: number;
  status: RemoteTipStatus;
}

function toRemoteTip(t: ServerTip): RemoteTip {
  return {
    id: t.id,
    amount: t.amountCents / 100,
    fromName: t.fanName,
    message: t.message,
    timestamp: t.createdAt,
    djId: t.djId,
    djName: t.djName,
    status: t.status,
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${init?.method ?? "GET"} ${path} failed (HTTP ${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export class InsufficientFundsError extends Error {
  readonly name = "InsufficientFundsError";
}

export interface SendTipArgs {
  id: string;
  djId: string;
  djName: string;
  amount: number; // euros
  message: string;
  fanName: string;
}

/** Sends a tip; returns the created tip and the new authoritative balance (euros). */
export async function sendTipRemote(
  args: SendTipArgs,
): Promise<{ tip: RemoteTip; balance: number }> {
  const fanWalletId = await getWalletId();
  const res = await fetch(`${API_BASE_URL}/api/tips`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: args.id,
      fanWalletId,
      fanName: args.fanName,
      djId: args.djId,
      djName: args.djName,
      amountCents: Math.round(args.amount * 100),
      message: args.message,
    }),
  });

  if (res.status === 402) throw new InsufficientFundsError("Solde insuffisant.");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST /api/tips failed (HTTP ${res.status}): ${text}`);
  }

  const data = (await res.json()) as { tip: ServerTip; balanceCents: number };
  return { tip: toRemoteTip(data.tip), balance: data.balanceCents / 100 };
}

export async function acceptTipRemote(id: string): Promise<RemoteTip> {
  const data = await api<{ tip: ServerTip }>(`/api/tips/${id}/accept`, { method: "POST" });
  return toRemoteTip(data.tip);
}

export async function refuseTipRemote(id: string): Promise<RemoteTip> {
  const data = await api<{ tip: ServerTip }>(`/api/tips/${id}/refuse`, { method: "POST" });
  return toRemoteTip(data.tip);
}

/** All tips sent by this device's wallet (used to hydrate the local cache). */
export async function listMyTipsRemote(): Promise<RemoteTip[]> {
  const fanWalletId = await getWalletId();
  const data = await api<{ tips: ServerTip[] }>(
    `/api/tips?fanWalletId=${encodeURIComponent(fanWalletId)}`,
  );
  return data.tips.map(toRemoteTip);
}

/** Authoritative wallet balance in euros, or null if unavailable. */
export async function getWalletBalanceRemote(): Promise<number | null> {
  if (!isApiConfigured()) return null;
  const walletId = await getWalletId();
  try {
    const data = await api<{ balanceCents: number }>(
      `/api/wallet/${encodeURIComponent(walletId)}/balance`,
    );
    return data.balanceCents / 100;
  } catch {
    return null;
  }
}
