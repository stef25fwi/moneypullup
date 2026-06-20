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
