import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import type { Tip } from "@/contexts/TipsContext";
import { firebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { acceptTip as acceptTipFn, refuseTip as refuseTipFn } from "@/lib/tipFunctions";
import { subscribePendingTipsForDj, type StreamTip } from "@/lib/tipStream";

export interface DjInbox {
  /** True when Firebase is configured (server-authoritative tips). */
  active: boolean;
  pendingTips: Tip[];
  accept: (id: string) => void;
  refuse: (id: string) => void;
}

function toTip(t: StreamTip): Tip {
  return {
    id: t.id,
    amount: t.amount,
    fromName: t.fanName,
    message: t.message,
    timestamp: t.createdAt,
    djId: t.djId,
    djName: "",
    status: "pending",
  };
}

/**
 * Live inbox of pending (held) tips for the signed-in DJ. Accept captures the
 * PaymentIntent, refuse cancels it — both via Cloud Functions. Falls back to
 * inactive when Firebase is not configured (the screen then uses local state).
 */
export function useDjInbox(): DjInbox {
  const active = isFirebaseConfigured();
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    if (!active) return;
    let unsubTips: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(firebaseAuth(), (user) => {
      unsubTips?.();
      unsubTips = null;
      if (user) {
        unsubTips = subscribePendingTipsForDj(
          user.uid,
          (streamTips) => setTips(streamTips.map(toTip)),
          () => {},
        );
      } else {
        setTips([]);
      }
    });

    return () => {
      unsubAuth();
      unsubTips?.();
    };
  }, [active]);

  return {
    active,
    pendingTips: tips,
    accept: (id) => {
      acceptTipFn(id).catch(() => {});
    },
    refuse: (id) => {
      refuseTipFn(id).catch(() => {});
    },
  };
}
