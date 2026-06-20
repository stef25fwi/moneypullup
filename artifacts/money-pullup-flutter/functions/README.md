# Money Pull Up — Cloud Functions (manual-capture tips)

Stripe Connect Express + PaymentIntent **manual capture**. The client never
touches the Stripe secret key — it only calls these callable functions, which
call Stripe.

## Callable functions (region `europe-west1`)

| Function | Role |
| --- | --- |
| `createDjConnectAccount` | Create the DJ's Stripe Express account, store it on `djs/{djId}`. |
| `createDjOnboardingLink` | Hosted onboarding (KYC + bank) link. |
| `getDjAccountStatus` | Refresh & persist `payoutsEnabled` etc. |
| `createTipPaymentIntent` | Authorise a tip (`capture_method=manual`, `application_fee_amount`, `transfer_data.destination`), create `tips/{tipId}` as `requires_capture`, return the `clientSecret`. |
| `acceptTip` | DJ accepts → **capture** the PaymentIntent → `captured`. |
| `refuseTip` | DJ refuses → **cancel** the PaymentIntent → `cancelled` (fan never charged). |
| `stripeWebhook` (HTTP) | Sync tip status from Stripe events. |

## Flow

```
Fan confirms (Payment Sheet) → PaymentIntent requires_capture (funds held)
DJ accepts  → acceptTip  → capture → captured (DJ gets amount − commission)
DJ refuses  → refuseTip  → cancel  → cancelled (hold released)
```

## Config

Set function secrets/env (see `.env.example`):

```sh
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
# COMMISSION_PERCENT defaults to 0.10
```

## Local development

```sh
npm install
npm run build
# functions/.env (gitignored) with STRIPE_SECRET_KEY=sk_test_… for local runs
firebase emulators:start --only functions,firestore,auth
```

## Data model

- `djs/{djId}`: `{ ownerUid, name, stripeAccountId, payoutsEnabled, chargesEnabled, detailsSubmitted, isLive }`
- `tips/{tipId}`: `{ fanUid, fanName, djId, djName, djOwnerUid, amountCents, applicationFeeCents, currency, message, status, stripePaymentIntentId, createdAt, updatedAt }`
  - `status`: `requires_capture` → `captured` | `cancelled` | `failed`

Tips are written only by these functions; security rules in
`../firestore.rules` enforce read access (fan or DJ owner) and block client
writes.
