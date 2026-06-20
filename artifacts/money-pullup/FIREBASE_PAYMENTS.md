# Expo — tips (manual-capture) via Firebase + Stripe Payment Sheet

The Expo app calls the same Cloud Functions as Flutter (see
`../money-pullup-flutter/functions`). The fan authorises a tip with the Stripe
Payment Sheet (funds held); the DJ accepts (capture) or refuses (cancel) live.

## Layers

- `lib/firebase.ts` — Firebase init (env-driven), anonymous sign-in, accessors.
- `lib/tipFunctions.ts` — callable wrappers (create intent, accept, refuse, Connect).
- `lib/tipStream.ts` — Firestore realtime subscription (pending tips per DJ).
- `hooks/useTipCheckout.ts` — fan flow: create PaymentIntent → Payment Sheet.
- `hooks/useDjInbox.ts` — live DJ inbox + accept/refuse.
- `app/_layout.tsx` — `StripeProvider` + anonymous sign-in on mount.
- `app/(tabs)/index.tsx` — fan "send tip" routes through the Payment Sheet when
  Firebase is configured (else legacy prepaid-wallet path).
- `app/(tabs)/dj.tsx` — pending tips come live from Firestore; accept captures.

## Configuration (env, read at build time)

| Variable | Notes |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` … `_APP_ID` | Firebase web config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` / `pk_live_…`. |

When the Firebase vars are absent, the app falls back to its previous local
behaviour, so it keeps running unconfigured.

## Important: native build required

`@stripe/stripe-react-native` is a native module — the Payment Sheet needs a
**custom dev build** (`expo prebuild` / EAS), not Expo Go, and is **not
supported on web**. Run on a device/simulator:

```sh
npx expo run:ios   # or run:android
# with: --dart-define equivalents are passed via EXPO_PUBLIC_* env at build
```

Firebase (JS SDK) works everywhere; only the Payment Sheet step requires native.
