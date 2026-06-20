import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { subscribeReceivedTipsForDj, type StreamTip } from "@/lib/tipStream";

export interface DjWallet {
  /** True when Firebase is configured (real captured-tip totals). */
  active: boolean;
  /** Total tips received (captured), in euros. */
  totalReceived: number;
  /** Tips received tonight (since 00:00 today), in euros — the "soirée" figure. */
  tonightReceived: number;
  /** Largest single captured tip, in euros. */
  biggest: number;
  /** Number of captured tips. */
  count: number;
}

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * DJ-only wallet: the live total of tips actually received (captured) plus the
 * amount collected during the current evening. Server-authoritative via
 * Firestore; inactive (zeros) when Firebase is not configured.
 */
export function useDjWallet(): DjWallet {
  const active = isFirebaseConfigured();
  const [tips, setTips] = useState<StreamTip[]>([]);

  useEffect(() => {
    if (!active) return;
    let unsubTips: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(firebaseAuth(), (user) => {
      unsubTips?.();
      unsubTips = null;
      if (user) {
        unsubTips = subscribeReceivedTipsForDj(user.uid, setTips, () => {});
      } else {
        setTips([]);
      }
    });

    return () => {
      unsubAuth();
      unsubTips?.();
    };
  }, [active]);

  return useMemo(() => {
    const since = startOfToday();
    let total = 0;
    let tonight = 0;
    let biggest = 0;
    for (const tip of tips) {
      total += tip.amount;
      if (tip.createdAt.getTime() >= since) tonight += tip.amount;
      if (tip.amount > biggest) biggest = tip.amount;
    }
    return { active, totalReceived: total, tonightReceived: tonight, biggest, count: tips.length };
  }, [active, tips]);
}
