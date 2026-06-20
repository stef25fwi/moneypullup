# Stripe — wallet top-ups (Checkout)

Real Stripe integration for crediting the in-app wallet. The client opens a
Stripe-hosted Checkout page; the wallet is credited server-side by the webhook.

## Endpoints

| Method | Path                       | Purpose                                              |
| ------ | -------------------------- | ---------------------------------------------------- |
| `GET`  | `/api/payments/config`     | Returns `{ publishableKey }` for the client.         |
| `POST` | `/api/payments/checkout`   | Creates a Checkout Session, returns `{ url }`.       |
| `POST` | `/api/payments/webhook`    | Stripe webhook (raw body, signature verified).       |

`POST /api/payments/checkout` body:

```json
{ "amount": 20, "successUrl": "money-pullup://wallet/topup?status=success", "cancelUrl": "money-pullup://wallet/topup?status=cancel" }
```

`amount` is in euros (1–1000). It is converted to cents server-side.

## Connect endpoints (DJ payouts)

DJs are paid via Stripe Connect Express accounts. Tips collected on the
platform balance are transferred to a DJ's connected account, which Stripe
pays out to their bank.

| Method | Path                                | Purpose                                                  |
| ------ | ----------------------------------- | -------------------------------------------------------- |
| `POST` | `/api/connect/accounts`             | Create an Express account for a DJ → `{ accountId }`.    |
| `POST` | `/api/connect/onboarding-link`      | Hosted KYC/bank onboarding link → `{ url }`.             |
| `GET`  | `/api/connect/accounts/:accountId`  | Readiness → `{ detailsSubmitted, chargesEnabled, payoutsEnabled }`. |
| `POST` | `/api/connect/payouts`              | Transfer platform funds to a DJ → `{ transferId }`.      |

`POST /api/connect/payouts` body: `{ "accountId": "acct_…", "amount": 25 }`
(`amount` in euros). The platform Stripe balance must hold enough funds.

Enable **Connect** in the Stripe Dashboard and configure the Express
onboarding branding before going live.

## Server-side wallet (source of truth)

When a database is provisioned, the webhook credits an authoritative wallet
ledger so top-ups are recorded reliably (idempotent on the Checkout Session id).

- Tables: `wallets` (balance per device wallet id) and `wallet_ledger`
  (append-only, PK = Stripe reference → re-delivered webhooks are no-ops).
- The client sends a persisted `walletId` with each Checkout Session; the
  webhook credits that wallet on `checkout.session.completed`.
- `GET /api/wallet/:walletId/balance` → `{ balanceCents, currency }`.

Run migrations from `lib/db`:

```sh
DATABASE_URL=postgres://… pnpm --filter @workspace/db run push
```

Without `DATABASE_URL` the server still boots; top-ups are logged but not
persisted, and the balance route returns `503 db_not_configured`. The in-app
spendable balance is still tracked locally (it also nets out local tip
spending); the DB wallet is the financial record of money moved through Stripe.

## Tips & balances (server-authoritative, requires DB)

Tips are recorded server-side so the fan wallet is the single source of truth.

| Method | Path                          | Purpose                                                    |
| ------ | ----------------------------- | ---------------------------------------------------------- |
| `POST` | `/api/tips`                   | Send a tip: debits the fan wallet, creates a pending tip.  |
| `GET`  | `/api/tips?djId=&fanWalletId=`| List tips (filter by DJ and/or fan wallet).                |
| `POST` | `/api/tips/:id/accept`        | DJ claims a pending tip.                                   |
| `POST` | `/api/tips/:id/refuse`        | Refuse a pending tip and refund the fan.                   |
| `GET`  | `/api/djs/:djId/earnings`     | `{ totalCents, availableCents }` (accepted minus payouts). |

- `POST /api/tips` is idempotent on a client-supplied `id`; insufficient
  balance returns `402`.
- `POST /api/connect/payouts` accepts an optional `djId`; when set (and a DB is
  configured) the available balance is enforced and the payout is recorded in
  the DJ ledger, so `availableCents` nets out completed payouts.
- The client (`TipsContext`) applies optimistic local updates and reconciles
  with these endpoints when `EXPO_PUBLIC_API_URL` is set, falling back to fully
  local behaviour offline / when unconfigured.

## Required environment variables (server)

| Variable                 | Notes                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`      | `sk_test_…` / `sk_live_…`. Never ship to the client.         |
| `STRIPE_WEBHOOK_SECRET`  | `whsec_…` from the webhook endpoint (or `stripe listen`).    |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` / `pk_live_…`. Optional, served via `/config`.   |
| `DATABASE_URL`           | Postgres connection string. Optional; enables wallet ledger. |

Payment routes return `503 stripe_not_configured` until `STRIPE_SECRET_KEY` is
set, so the rest of the server still boots without Stripe configured.

## Client environment variable (money-pullup)

| Variable              | Notes                                                |
| --------------------- | ---------------------------------------------------- |
| `EXPO_PUBLIC_API_URL` | Base URL of this server, e.g. `https://api.example`. |

## Local webhook testing

```sh
stripe listen --forward-to localhost:$PORT/api/payments/webhook
```

Copy the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

## Crediting the wallet

The wallet is credited authoritatively on `checkout.session.completed` in
`src/routes/payments.ts`. The current app keeps the balance locally
(AsyncStorage) and reflects top-ups optimistically; wire the webhook handler to
a server-side wallet model (`@workspace/db`) using `metadata.wallet_id` and
`metadata.amount_cents` once one exists.
