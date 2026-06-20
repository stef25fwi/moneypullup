# Flutter — tips (manual-capture) integration

The Flutter app talks to the Cloud Functions in `functions/` (never to Stripe
directly). Money flow: the fan authorises a tip via the Stripe Payment Sheet
(funds held), the DJ accepts (capture) or refuses (cancel).

## Layers

- `core/services/app_bootstrap.dart` — Firebase + Stripe init + anonymous sign-in.
- `core/services/functions_api.dart` — callable wrappers (create intent, accept,
  refuse, Connect onboarding).
- `core/services/tip_payments.dart` — fan flow: create PaymentIntent → present
  Payment Sheet → `authorized` / `cancelled`.
- `core/services/firestore_repository.dart` — realtime tip streams.
- `core/state/remote_tips_controller.dart` — live DJ dashboard + accept/refuse.

`main.dart` boots Firebase/Stripe, signs in, binds the DJ dashboard to the live
stream, and routes the fan "send tip" button through the Payment Sheet.

## Setup

1. **Firebase config** — run `flutterfire configure` (generates
   `firebase_options.dart` and native config). Pass the options to
   `Firebase.initializeApp` for web.
2. **Dependencies** — `flutter pub get` (adds firebase_core/auth/firestore/
   functions and flutter_stripe).
3. **Stripe publishable key** — provide at build time:
   ```sh
   flutter run --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```
4. **Deploy backend** — `firebase deploy --only functions,firestore:rules,firestore:indexes`.
5. **DJ onboarding** — a DJ must complete Stripe onboarding
   (`createDjConnectAccount` + `createDjOnboardingLink`) before tips can be sent;
   `createTipPaymentIntent` rejects DJs without `payoutsEnabled`.

## Notes

- Single-device demo: the signed-in anonymous user is also the DJ
  (`_djId = AppBootstrap.currentUid`). Wire real identities later.
- The prepaid wallet / "Recharger" UI is now **vestigial** under manual capture
  (the fan pays per tip). It is kept compiling but should be removed in a
  dedicated UI pass.
- Tip status maps: `requires_capture → pending`, `captured → accepted`,
  `cancelled`/`failed → refused`.
