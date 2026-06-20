import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Authoritative record of money that flowed through Stripe for a fan wallet.
 *
 * The in-app spendable balance is still kept locally (it also nets out local
 * tip spending), but top-ups are credited here by the Stripe webhook so the
 * platform has a reliable financial source of truth.
 */
export const walletsTable = pgTable("wallets", {
  // Client-generated wallet id (persisted on the device).
  id: text("id").primaryKey(),
  balanceCents: integer("balance_cents").notNull().default(0),
  currency: text("currency").notNull().default("eur"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Append-only ledger. The primary key is the Stripe reference (Checkout
 * Session id) so re-delivered webhooks are idempotent.
 */
export const walletLedgerTable = pgTable("wallet_ledger", {
  // Stripe reference (e.g. Checkout Session id) — guarantees idempotency.
  id: text("id").primaryKey(),
  walletId: text("wallet_id").notNull(),
  // Positive = credit (top-up), negative = debit.
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("eur"),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Wallet = typeof walletsTable.$inferSelect;
export type WalletLedgerEntry = typeof walletLedgerTable.$inferSelect;
