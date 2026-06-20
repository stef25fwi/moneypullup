import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Server-authoritative tips.
 *
 * Sending a tip debits the fan wallet (see wallet_ledger) and creates a row
 * here as `pending`. The DJ accepts (claims) or refuses (refunds the fan).
 * The `id` is client-supplied so retries are idempotent.
 */
export const tipsTable = pgTable("tips", {
  id: text("id").primaryKey(),
  fanWalletId: text("fan_wallet_id").notNull(),
  fanName: text("fan_name").notNull().default("Fan"),
  djId: text("dj_id").notNull(),
  djName: text("dj_name").notNull().default(""),
  amountCents: integer("amount_cents").notNull(),
  message: text("message").notNull().default(""),
  // "pending" | "accepted" | "refused"
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Append-only ledger for a DJ's money movements (payouts via Stripe Connect).
 * Available earnings = sum(accepted tips) + sum(this ledger), where payouts are
 * stored as negative amounts. PK = Stripe transfer id for idempotency.
 */
export const djLedgerTable = pgTable("dj_ledger", {
  id: text("id").primaryKey(),
  djId: text("dj_id").notNull(),
  amountCents: integer("amount_cents").notNull(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Tip = typeof tipsTable.$inferSelect;
export type DjLedgerEntry = typeof djLedgerTable.$inferSelect;
