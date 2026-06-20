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

## Required environment variables (server)

| Variable                 | Notes                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`      | `sk_test_…` / `sk_live_…`. Never ship to the client.         |
| `STRIPE_WEBHOOK_SECRET`  | `whsec_…` from the webhook endpoint (or `stripe listen`).    |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_…` / `pk_live_…`. Optional, served via `/config`.   |

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
