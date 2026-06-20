# Wallet rechargeable (prépayé) — implémentation complète & guide de ré-intégration

> Ce fichier rassemble **toute** la logique du *wallet prépayé rechargeable* qui a
> été retirée de l'UI fan (le fan paie désormais par tip via la Stripe Payment
> Sheet — capture manuelle). Il permet de **réintégrer** le wallet plus tard sans
> rien réécrire : le code exact est inclus en annexe.

## 1. Principe

Le wallet prépayé fonctionne ainsi :

1. Le fan **recharge** un solde via **Stripe Checkout** (page hébergée, ouverte
   dans un navigateur in-app). Le serveur crée la session de paiement ; à la
   réussite, un **webhook Stripe** crédite le solde du wallet (`walletsTable`).
2. Le solde est **affiché** dans l'UI fan (bouton solde, carte hero).
3. **Envoyer un tip** = **débit** atomique du solde côté serveur (`sendTip`),
   avec écriture d'un ledger (`walletLedgerTable`). Si solde insuffisant →
   blocage + invite à recharger.
4. Refus d'un tip → **remboursement** du solde (ledger inverse).

> ⚠️ Ce modèle est **alternatif** au modèle « capture manuelle par tip » (Firebase
> Functions + Payment Sheet) actuellement en place. Réintégrer le wallet signifie
> soit le faire cohabiter (le fan choisit), soit revenir au modèle prépayé.

## 2. Inventaire des pièces

### Encore présentes dans le repo (réutilisables telles quelles)
| Fichier | Rôle |
| --- | --- |
| `artifacts/money-pullup/lib/payments.ts` | `startWalletTopUp()` → crée la session Checkout + ouvre le navigateur (Annexe B). |
| `artifacts/money-pullup/lib/walletId.ts` | Identifiant de wallet persistant côté device (Annexe B). |
| `artifacts/money-pullup/contexts/TipsContext.tsx` | État `wallet`, `addFunds`, `openStripeModal`/`closeStripeModal`, `isStripeModalVisible`, hydratation du solde depuis le serveur, débit dans `sendTip`. **Non supprimé** — encore exporté par le contexte. |
| `artifacts/api-server/src/routes/payments.ts` | Endpoint `POST /api/payments/checkout` + webhook Stripe créditant le wallet (Annexe C). |
| `artifacts/api-server/src/lib/wallet.ts` | Logique de crédit/solde du wallet (Annexe C). |
| `artifacts/api-server/src/lib/tips.ts` | `sendTip` (débit) / `refuseTip` (remboursement) sur le wallet. |

### Supprimées (à recréer)
| Élément | Où | Récupération |
| --- | --- | --- |
| `components/StripeModal.tsx` (modal de recharge Expo) | Expo | **Annexe A** (code complet). |
| UI wallet fan Expo (bouton solde, RECHARGER, barre « solde faible », placeholder, montage du modal, branche débit dans `handleSendTip`, styles `walletBtn`/`walletText`/`lowBalBar`/`lowBalText`) | `app/(tabs)/index.tsx` | **Annexe D** (patch à inverser). |
| UI wallet fan Flutter (chip solde du `HeroDjCard`, bouton `RECHARGER`, dialog `_handleRecharge`, champs `walletBalance`/`onAddFunds`, état `_walletBalance`) | `lib/main.dart` | **Annexe D** (patch à inverser). |

## 3. Variables d'environnement

| Variable | Côté | Usage |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Expo | Base URL du serveur de paiement (Checkout). |
| `STRIPE_SECRET_KEY` | api-server | Création des sessions Checkout. |
| `STRIPE_WEBHOOK_SECRET` | api-server | Vérification du webhook qui crédite le wallet. |

## 4. Étapes de ré-intégration

### A. Expo
1. **Recréer** `components/StripeModal.tsx` depuis l'**Annexe A**.
2. Dans `app/(tabs)/index.tsx`, réappliquer l'inverse du patch (**Annexe D**) :
   - rebrancher `wallet`, `openStripeModal`, `isStripeModalVisible`,
     `closeStripeModal`, `sendTip` depuis `useTips()` ;
   - réimporter `StripeModal` ;
   - remettre le bouton solde (top bar), le bouton `RECHARGER`, la barre
     « solde faible », le placeholder « Max disponible », le `<StripeModal .../>`,
     et les styles `walletBtn`/`walletText`/`lowBalBar`/`lowBalText` ;
   - dans `handleSendTip`, remettre la branche de débit wallet (garder ou non le
     chemin Payment Sheet selon le modèle voulu).
3. `lib/payments.ts` et `lib/walletId.ts` sont déjà présents (Annexe B) — rien à faire.
4. Le `TipsContext` expose déjà tout le wallet : aucune modif nécessaire.

### B. Flutter
1. Dans `lib/main.dart`, réappliquer l'inverse du patch (**Annexe D**) :
   - `HeroDjCard` : remettre le champ `walletBalance` + le chip Positioned (icône
     + `'$walletBalance €'`) ;
   - remettre l'`ActionSideButton` `RECHARGER` (`onTap: _handleRecharge`) ;
   - remettre la méthode `_handleRecharge` (dialog de montants 10/20/50/100) ;
   - `FanPage` : remettre `walletBalance` + `onAddFunds` ;
   - `_MoneyPullUpShellState` : remettre `int _walletBalance` + la closure
     `onAddFunds`, et passer `walletBalance`/`onAddFunds` à `FanPage`.
2. (Optionnel) Brancher le solde sur le vrai backend wallet plutôt que sur l'état
   local cosmétique.

### C. Backend (api-server)
1. `routes/payments.ts` (Annexe C) : endpoint Checkout + webhook déjà présents.
2. Configurer l'endpoint webhook Stripe vers `/api/payments/webhook` (ou le chemin
   défini dans `app.ts`) et renseigner `STRIPE_WEBHOOK_SECRET`.
3. Vérifier la table `wallets` / `wallet_ledger` (schéma DB) et `lib/wallet.ts`.

---

# Annexes — code source exact

## Annexe A — `components/StripeModal.tsx` (supprimé — recréer ce fichier)

```tsx
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/contexts/ThemeContext";
import { useTips } from "@/contexts/TipsContext";
import { PaymentConfigError, startWalletTopUp } from "@/lib/payments";

const FUND_AMOUNTS = [10, 20, 50, 100];

interface StripeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StripeModal({ visible, onClose }: StripeModalProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { addFunds } = useTips();
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = useCallback(async () => {
    setIsProcessing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await startWalletTopUp(selectedAmount);

      if (result === "success") {
        // The wallet is credited authoritatively by the Stripe webhook; we
        // optimistically reflect the new balance for immediate feedback.
        addFunds(selectedAmount);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onClose();
        Alert.alert(
          "Rechargement réussi",
          `${selectedAmount}€ ajoutés à votre portefeuille !`,
          [{ text: "Super !" }]
        );
      } else if (result === "cancelled") {
        Alert.alert("Paiement annulé", "Aucun montant n'a été débité.");
      }
      // "dismissed" (e.g. web redirect or closed sheet): stay silent.
    } catch (err) {
      const message =
        err instanceof PaymentConfigError
          ? "Le paiement n'est pas configuré. Veuillez réessayer plus tard."
          : "Le paiement a échoué. Veuillez réessayer.";
      Alert.alert("Erreur de paiement", message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAmount, addFunds, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { borderColor: colors.glassBorder }]}>
          {Platform.OS !== "web" && (
            <BlurView
              intensity={isDark ? 60 : 80}
              tint={isDark ? "dark" : "light"}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 28, borderTopRightRadius: 28 }]}
            />
          )}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(13,0,24,0.75)" : "rgba(243,238,255,0.85)", borderTopLeftRadius: 28, borderTopRightRadius: 28 }]} />
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.stripeRow}>
              <MaterialIcons name="credit-card" size={22} color={colors.violet} />
              <Text style={[styles.stripeLabel, { color: colors.violet }]}>
                Stripe Secure
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            Recharger le portefeuille
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Choisissez le montant à ajouter
          </Text>

          <View style={styles.amountsGrid}>
            {FUND_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                onPress={() => {
                  setSelectedAmount(amt);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                style={[
                  styles.amountBtn,
                  {
                    backgroundColor:
                      selectedAmount === amt ? colors.primary : colors.secondary,
                    borderColor:
                      selectedAmount === amt ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.amountBtnText,
                    {
                      color:
                        selectedAmount === amt
                          ? colors.primaryForeground
                          : colors.foreground,
                    },
                  ]}
                >
                  {amt}€
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={[
              styles.cardPreview,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={18} color={colors.mutedForeground} />
            <Text style={[styles.cardText, { color: colors.mutedForeground }]}>
              Paiement par carte via la page sécurisée Stripe
            </Text>
          </View>

          <TouchableOpacity
            onPress={handlePay}
            disabled={isProcessing}
            style={[
              styles.payBtn,
              {
                backgroundColor: isProcessing ? colors.muted : colors.primary,
                shadowColor: colors.primary,
              },
            ]}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <Text style={[styles.payBtnText, { color: colors.primaryForeground }]}>
                Traitement...
              </Text>
            ) : (
              <>
                <Feather name="zap" size={18} color={colors.primaryForeground} />
                <Text style={[styles.payBtnText, { color: colors.primaryForeground }]}>
                  Payer {selectedAmount}€
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.secureNote, { color: colors.mutedForeground }]}>
            Paiement sécurisé via Stripe — Vos données sont protégées
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444",
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stripeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stripeLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },
  amountsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  amountBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
  },
  amountBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 2,
  },
  cardBrand: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
  secureNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});

```

## Annexe B — `lib/payments.ts` (présent)

```ts
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { API_BASE_URL, isApiConfigured } from "@/constants/config";
import { getWalletId } from "@/lib/walletId";

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
  const successUrl = Linking.createURL("wallet/topup", {
    queryParams: { status: "success", amount: String(amount) },
  });
  const cancelUrl = Linking.createURL("wallet/topup", { queryParams: { status: "cancel" } });

  const walletId = await getWalletId();
  const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount, successUrl, cancelUrl, walletId }),
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

```

### `lib/walletId.ts` (présent)

```ts
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

```

## Annexe C — Backend (présent)

### `api-server/src/routes/payments.ts`

```ts
import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import type Stripe from "stripe";
import {
  getPublishableKey,
  getStripe,
  getWebhookSecret,
  StripeNotConfiguredError,
} from "../lib/stripe";
import { creditWallet, getWalletBalance, isDbConfigured } from "../lib/wallet";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CURRENCY = "eur";
const MIN_AMOUNT_EUR = 1;
const MAX_AMOUNT_EUR = 1000;

const CheckoutBody = z.object({
  // Amount to top up, expressed in euros (e.g. 20 or 12.5).
  amount: z
    .number()
    .positive()
    .min(MIN_AMOUNT_EUR)
    .max(MAX_AMOUNT_EUR),
  // Deep links the hosted Checkout page redirects back to.
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  // Opaque identifier for the wallet being credited (used by the webhook).
  walletId: z.string().min(1).max(128).optional(),
});

function handleStripeError(res: Response, err: unknown): void {
  if (err instanceof StripeNotConfiguredError) {
    res.status(503).json({ error: "stripe_not_configured", message: err.message });
    return;
  }
  logger.error({ err }, "Stripe request failed");
  res.status(502).json({ error: "stripe_error", message: "Payment provider request failed." });
}

/**
 * Returns the publishable key so the client can be configured without
 * hard-coding it into the bundle.
 */
router.get("/payments/config", (_req: Request, res: Response) => {
  res.json({ publishableKey: getPublishableKey() });
});

/**
 * Creates a Stripe Checkout Session for a wallet top-up and returns the hosted
 * payment page URL. The client opens it (in-app browser on native, redirect on
 * web); the wallet is credited server-side by the webhook below.
 */
router.post("/payments/checkout", async (req: Request, res: Response) => {
  const parsed = CheckoutBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }

  const { amount, successUrl, cancelUrl, walletId } = parsed.data;
  const amountInCents = Math.round(amount * 100);

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: amountInCents,
            product_data: {
              name: "Recharge du portefeuille Money Pull-up",
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "wallet_topup",
        amount_cents: String(amountInCents),
        ...(walletId ? { wallet_id: walletId } : {}),
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    handleStripeError(res, err);
  }
});

/**
 * Stripe webhook endpoint. Mounted with a raw body parser in `app.ts` so the
 * signature can be verified. This is the source of truth for crediting wallets.
 */
router.post("/payments/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") {
    res.status(400).json({ error: "missing_signature" });
    return;
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    // req.body is a Buffer here thanks to express.raw() in app.ts.
    event = stripe.webhooks.constructEvent(req.body, signature, getWebhookSecret());
  } catch (err) {
    logger.warn({ err }, "Stripe webhook signature verification failed");
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const amountCents = Number(session.metadata?.["amount_cents"] ?? session.amount_total ?? 0);
    const walletId = session.metadata?.["wallet_id"];

    if (walletId && amountCents > 0 && isDbConfigured()) {
      try {
        const credited = await creditWallet({ ref: session.id, walletId, amountCents });
        logger.info(
          { sessionId: session.id, walletId, amountCents, credited },
          credited ? "Wallet credited" : "Top-up already processed (idempotent)",
        );
      } catch (err) {
        // Return 5xx so Stripe retries; creditWallet is idempotent.
        logger.error({ err, sessionId: session.id }, "Failed to credit wallet");
        res.status(500).json({ error: "wallet_credit_failed" });
        return;
      }
    } else {
      logger.info(
        { sessionId: session.id, walletId, amountCents, dbConfigured: isDbConfigured() },
        "Top-up paid — not persisted (no walletId or DB not configured)",
      );
    }
  }

  res.json({ received: true });
});

/** Returns the authoritative (server-side) balance for a wallet. */
router.get("/wallet/:walletId/balance", async (req: Request, res: Response) => {
  if (!isDbConfigured()) {
    res.status(503).json({ error: "db_not_configured" });
    return;
  }
  const walletId = req.params["walletId"];
  if (typeof walletId !== "string" || walletId.length === 0) {
    res.status(400).json({ error: "invalid_wallet_id" });
    return;
  }

  try {
    const wallet = await getWalletBalance(walletId);
    res.json({
      walletId,
      balanceCents: wallet?.balanceCents ?? 0,
      currency: wallet?.currency ?? "eur",
    });
  } catch (err) {
    logger.error({ err, walletId }, "Failed to read wallet balance");
    res.status(500).json({ error: "wallet_read_failed" });
  }
});

export default router;

```

### `api-server/src/lib/wallet.ts`

```ts
import { eq, sql } from "drizzle-orm";
import { getDb, isDbConfigured, walletLedgerTable, walletsTable } from "@workspace/db";

export { isDbConfigured };

const DEFAULT_CURRENCY = "eur";

/**
 * Idempotently credits a wallet for a paid top-up.
 *
 * The Stripe reference (`ref`, e.g. the Checkout Session id) is the ledger
 * primary key, so a re-delivered webhook inserts nothing and leaves the balance
 * untouched. Returns `true` when this call actually applied the credit.
 */
export async function creditWallet(opts: {
  ref: string;
  walletId: string;
  amountCents: number;
  currency?: string;
}): Promise<boolean> {
  const db = getDb();
  const currency = opts.currency ?? DEFAULT_CURRENCY;

  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(walletLedgerTable)
      .values({
        id: opts.ref,
        walletId: opts.walletId,
        amountCents: opts.amountCents,
        currency,
        type: "topup",
      })
      .onConflictDoNothing()
      .returning({ id: walletLedgerTable.id });

    if (inserted.length === 0) return false; // already processed

    await tx
      .insert(walletsTable)
      .values({ id: opts.walletId, balanceCents: opts.amountCents, currency })
      .onConflictDoUpdate({
        target: walletsTable.id,
        set: {
          balanceCents: sql`${walletsTable.balanceCents} + ${opts.amountCents}`,
          updatedAt: new Date(),
        },
      });

    return true;
  });
}

/** Returns the authoritative wallet balance, or null if the wallet is unknown. */
export async function getWalletBalance(
  walletId: string,
): Promise<{ balanceCents: number; currency: string } | null> {
  const db = getDb();
  const rows = await db
    .select({ balanceCents: walletsTable.balanceCents, currency: walletsTable.currency })
    .from(walletsTable)
    .where(eq(walletsTable.id, walletId))
    .limit(1);

  return rows[0] ?? null;
}

```

## Annexe D — Patch de retrait de l UI wallet fan (commit 0fa4cda)

Pour réintégrer : remettre les lignes marquées `-` ci-dessous.

```diff
commit 0fa4cda26f84afbfc91d82fced8b864c33d58076
Author: Claude <noreply@anthropic.com>
Date:   Sat Jun 20 20:56:28 2026 +0000

    feat(fan): remove prepaid wallet from the fan UI
    
    The fan now pays per tip via the Stripe Payment Sheet (manual capture), so the
    prepaid wallet/recharge UI is gone from the fan screens.
    
    Flutter (main.dart):
    - HeroDjCard: drop the wallet balance chip (and its walletBalance param).
    - Remove the "RECHARGER" action button and the recharge dialog (_handleRecharge).
    - FanPage: drop walletBalance/onAddFunds; shell drops the cosmetic _walletBalance.
    - handleSendTip already routes through the Payment Sheet.
    
    Expo (index.tsx):
    - Remove the top-bar wallet balance button, the "RECHARGER" button, the low-
      balance bar and the recharge modal; custom-amount placeholder no longer
      references a balance.
    - handleSendTip always uses the Payment Sheet (no wallet branch); drop unused
      wallet/sendTip/openStripeModal context bindings, imports and styles.
    - Delete the now-orphaned StripeModal (fan top-up) component.
    
    DJ-side wallet (real total received + "ce soir") is unchanged. Expo typechecks;
    Flutter not compiled here. Existing Flutter widget tests don't reference the
    removed wallet UI.
    
    Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_017iruSbmNWbwmRBCjYT5Aof

diff --git a/artifacts/money-pullup-flutter/lib/main.dart b/artifacts/money-pullup-flutter/lib/main.dart
index 280b569..9853680 100644
--- a/artifacts/money-pullup-flutter/lib/main.dart
+++ b/artifacts/money-pullup-flutter/lib/main.dart
@@ -53,11 +53,6 @@ class _MoneyPullUpShellState extends State<MoneyPullUpShell> {
   final RemoteTipsController _controller = RemoteTipsController();
   late final String _djId;
 
-  // Cosmetic only under the manual-capture model: the fan now pays per tip via
-  // the Payment Sheet, so there is no prepaid wallet to debit. Kept so the
-  // existing wallet/recharge UI keeps compiling; remove in a dedicated UI pass.
-  int _walletBalance = 0;
-
   @override
   void initState() {
     super.initState();
@@ -98,9 +93,7 @@ class _MoneyPullUpShellState extends State<MoneyPullUpShell> {
             FanPage(
               currentIndex: navIndex,
               onNavChanged: (v) => setState(() => navIndex = v),
-              walletBalance: _walletBalance,
               onSendTip: _sendTip,
-              onAddFunds: (a) => setState(() => _walletBalance += a),
             ),
             DjDashboardPage(
               currentIndex: navIndex,
@@ -129,17 +122,13 @@ class _MoneyPullUpShellState extends State<MoneyPullUpShell> {
 class FanPage extends StatefulWidget {
   final int currentIndex;
   final ValueChanged<int> onNavChanged;
-  final int walletBalance;
   final Future<bool> Function(int amount, String message) onSendTip;
-  final ValueChanged<int> onAddFunds;
 
   const FanPage({
     super.key,
     required this.currentIndex,
     required this.onNavChanged,
-    required this.walletBalance,
     required this.onSendTip,
-    required this.onAddFunds,
   });
 
   @override
@@ -227,60 +216,6 @@ class _FanPageState extends State<FanPage> {
     );
   }
 
-  void _handleRecharge() {
-    showDialog(
-      context: context,
-      builder: (ctx) => AlertDialog(
-        backgroundColor: const Color(0xFF10081E),
-        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
-        title: const Text('Recharger le wallet',
-            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
-        content: Column(
-          mainAxisSize: MainAxisSize.min,
-          children: [10, 20, 50, 100].map((amount) {
-            return Padding(
-              padding: const EdgeInsets.only(bottom: 8),
-              child: SizedBox(
-                width: double.infinity,
-                child: OutlinedButton(
-                  onPressed: () {
-                    widget.onAddFunds(amount);
-                    Navigator.pop(ctx);
-                    if (!mounted) return;
-                    ScaffoldMessenger.of(context).showSnackBar(
-                      SnackBar(
-                        content: Text('💳 $amount€ rechargés !'),
-                        duration: const Duration(seconds: 2),
-                        backgroundColor: kCyan,
-                      ),
-                    );
-                  },
-                  style: OutlinedButton.styleFrom(
-                    foregroundColor: kCyan,
-                    side: const BorderSide(color: kCyan),
-                    padding: const EdgeInsets.symmetric(vertical: 14),
-                    shape: RoundedRectangleBorder(
-                        borderRadius: BorderRadius.circular(12)),
-                  ),
-                  child: Text('+$amount €',
-                      style: const TextStyle(
-                          fontSize: 18, fontWeight: FontWeight.w700)),
-                ),
-              ),
-            );
-          }).toList(),
-        ),
-        actions: [
-          TextButton(
-            onPressed: () => Navigator.pop(ctx),
-            child: const Text('Annuler',
-                style: TextStyle(color: Color(0xFFA9A3BA))),
-          ),
-        ],
-      ),
-    );
-  }
-
   @override
   Widget build(BuildContext context) {
     final media = MediaQuery.of(context).size;
@@ -350,9 +285,7 @@ class _FanPageState extends State<FanPage> {
                   veryCompact ? 4 : 8),
               child: Column(
                 children: [
-                  HeroDjCard(
-                      height: heroHeight,
-                      walletBalance: widget.walletBalance),
+                  HeroDjCard(height: heroHeight),
                   SizedBox(
                       height: veryCompact
                           ? 6
@@ -426,15 +359,6 @@ class _FanPageState extends State<FanPage> {
                         const SizedBox(width: 14),
                         Expanded(
                             child: MainTipButton(onTap: _handleSendTip)),
-                        const SizedBox(width: 14),
-                        ActionSideButton(
-                          width: sideButtonWidth,
-                          borderColor: kCyan,
-                          icon: Icons.account_balance_wallet_outlined,
-                          iconColor: kCyan,
-                          label: 'RECHARGER',
-                          onTap: _handleRecharge,
-                        ),
                       ],
                     ),
                   ),
@@ -498,9 +422,7 @@ class GlowBlob extends StatelessWidget {
 
 class HeroDjCard extends StatelessWidget {
   final double height;
-  final int walletBalance;
-  const HeroDjCard(
-      {super.key, required this.height, required this.walletBalance});
+  const HeroDjCard({super.key, required this.height});
 
   @override
   Widget build(BuildContext context) {
@@ -547,31 +469,6 @@ class HeroDjCard extends StatelessWidget {
                       letterSpacing: 0.5)),
             ),
           ),
-          Positioned(
-            top: 14,
-            right: 14,
-            child: Container(
-              height: 48,
-              padding: const EdgeInsets.symmetric(horizontal: 17),
-              decoration: BoxDecoration(
-                color: const Color.fromRGBO(20, 10, 35, 0.68),
-                borderRadius: BorderRadius.circular(26),
-                border: Border.all(color: kPink.withValues(alpha: 0.35)),
-              ),
-              child: Row(
-                children: [
-                  const Icon(Icons.account_balance_wallet_outlined,
-                      color: kPink, size: 21),
-                  const SizedBox(width: 10),
-                  Text('$walletBalance €',
-                      style: const TextStyle(
-                          color: Colors.white,
-                          fontSize: 17,
-                          fontWeight: FontWeight.w700)),
-                ],
-              ),
-            ),
-          ),
           const Positioned(
             left: 22,
             bottom: 88,
diff --git a/artifacts/money-pullup/app/(tabs)/index.tsx b/artifacts/money-pullup/app/(tabs)/index.tsx
index 26b0781..77603e5 100644
--- a/artifacts/money-pullup/app/(tabs)/index.tsx
+++ b/artifacts/money-pullup/app/(tabs)/index.tsx
@@ -25,12 +25,10 @@ import { useSafeAreaInsets } from "react-native-safe-area-context";
 import { GlowBackground } from "@/components/GlowBackground";
 import { GlassCard } from "@/components/GlassCard";
 import { TipButton } from "@/components/TipButton";
-import { StripeModal } from "@/components/StripeModal";
 import { useTips } from "@/contexts/TipsContext";
 import { useTheme } from "@/contexts/ThemeContext";
 import { useColors } from "@/hooks/useColors";
 import { useTipCheckout } from "@/hooks/useTipCheckout";
-import { isFirebaseConfigured } from "@/lib/firebase";
 
 const PRESET_AMOUNTS = [5, 10, 15, 20];
 
@@ -86,14 +84,9 @@ export default function FanScreen() {
   const { toggleTheme, isDark } = useTheme();
   const insets = useSafeAreaInsets();
   const {
-    wallet,
     djs,
     selectedDj,
     setSelectedDj,
-    sendTip,
-    openStripeModal,
-    isStripeModalVisible,
-    closeStripeModal,
   } = useTips();
   const tipCheckout = useTipCheckout();
 
@@ -137,33 +130,14 @@ export default function FanScreen() {
       Alert.alert("Montant invalide", "Veuillez saisir un montant valide.");
       return;
     }
-
-    // Target model: per-tip manual-capture PaymentIntent via Stripe Payment Sheet.
-    if (isFirebaseConfigured()) {
-      try {
-        const outcome = await tipCheckout(selectedDj.id, effectiveAmount, message);
-        if (outcome === "authorized") markSent(selectedDj.name);
-      } catch (e) {
-        Alert.alert("Paiement impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
-      }
-      return;
-    }
-
-    // Legacy prepaid-wallet path (no backend configured).
-    if (wallet.balance < effectiveAmount) {
-      Alert.alert(
-        "Solde insuffisant",
-        `Votre solde est de ${wallet.balance}€. Rechargez votre portefeuille.`,
-        [
-          { text: "Annuler", style: "cancel" },
-          { text: "Recharger", onPress: openStripeModal },
-        ]
-      );
-      return;
+    // Per-tip manual-capture PaymentIntent via the Stripe Payment Sheet.
+    try {
+      const outcome = await tipCheckout(selectedDj.id, effectiveAmount, message);
+      if (outcome === "authorized") markSent(selectedDj.name);
+    } catch (e) {
+      Alert.alert("Paiement impossible", e instanceof Error ? e.message : "Réessayez plus tard.");
     }
-    const success = sendTip(selectedDj.id, effectiveAmount, message);
-    if (success) markSent(selectedDj.name);
-  }, [selectedDj, effectiveAmount, wallet.balance, sendTip, message, openStripeModal, tipCheckout, markSent]);
+  }, [selectedDj, effectiveAmount, message, tipCheckout, markSent]);
 
   return (
     <View style={[styles.container, { backgroundColor: BG }]}>
@@ -186,11 +160,6 @@ export default function FanScreen() {
             >
               <Feather name={isDark ? "sun" : "moon"} size={16} color={isDark ? GOLD : "#8B5CF6"} />
             </TouchableOpacity>
-
-            <TouchableOpacity onPress={openStripeModal} style={[styles.walletBtn, { borderColor: GOLD }]}>
-              <Feather name="credit-card" size={14} color={GOLD} />
-              <Text style={[styles.walletText, { color: GOLD }]}>{wallet.balance.toFixed(2)}€</Text>
-            </TouchableOpacity>
           </View>
 
           {/* ── DJ Banner ── */}
@@ -345,12 +314,6 @@ export default function FanScreen() {
                 </Text>
               </TouchableOpacity>
             </Animated.View>
-
-            {/* RECHARGER */}
-            <TouchableOpacity onPress={openStripeModal} style={[styles.actionBtn, { backgroundColor: "#BB5500" }]}>
-              <MaterialCommunityIcons name="wallet-plus" size={17} color="#fff" />
-              <Text style={styles.actionBtnLabel}>RECHARGER</Text>
-            </TouchableOpacity>
           </View>
 
           {/* Custom amount input */}
@@ -358,7 +321,7 @@ export default function FanScreen() {
             <TextInput
               value={customAmount}
               onChangeText={setCustomAmount}
-              placeholder={`Max disponible: ${wallet.balance.toFixed(2)}€`}
+              placeholder="Montant libre en €"
               placeholderTextColor={isDark ? "rgba(200,150,255,0.4)" : "rgba(100,0,200,0.3)"}
               keyboardType="numeric"
               style={[
@@ -385,21 +348,8 @@ export default function FanScreen() {
             </GlassCard>
           )}
 
-          {/* Low balance */}
-          {wallet.balance < 5 && (
-            <TouchableOpacity
-              onPress={openStripeModal}
-              style={[styles.lowBalBar, { backgroundColor: "rgba(255,215,0,0.09)", borderColor: GOLD }]}
-            >
-              <Feather name="alert-circle" size={14} color={GOLD} />
-              <Text style={[styles.lowBalText, { color: GOLD }]}>Solde faible — Appuyez pour recharger</Text>
-              <Feather name="chevron-right" size={14} color={GOLD} />
-            </TouchableOpacity>
-          )}
         </ScrollView>
       </KeyboardAvoidingView>
-
-      <StripeModal visible={isStripeModalVisible} onClose={closeStripeModal} />
     </View>
   );
 }
@@ -410,8 +360,6 @@ const styles = StyleSheet.create({
 
   topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
   topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
-  walletBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22, borderWidth: 1.5, backgroundColor: "rgba(255,215,0,0.1)" },
-  walletText: { fontSize: 15, fontFamily: "Inter_700Bold" },
 
   djBanner: {
     flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 15, paddingHorizontal: 16,
@@ -464,7 +412,4 @@ const styles = StyleSheet.create({
   pendingBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 },
   pendingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
   pendingSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#F59E0B", marginTop: 2 },
-
-  lowBalBar: { flexDirection: "row", alignItems: "center", gap: 8, padding: 13, borderRadius: 13, borderWidth: 1 },
-  lowBalText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
 });

```
