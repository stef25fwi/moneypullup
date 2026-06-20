import { and, desc, eq, sql } from "drizzle-orm";
import {
  djLedgerTable,
  getDb,
  isDbConfigured,
  type Tip,
  tipsTable,
  walletLedgerTable,
  walletsTable,
} from "@workspace/db";

export { isDbConfigured };

export class InsufficientFundsError extends Error {
  readonly name = "InsufficientFundsError";
}
export class TipNotFoundError extends Error {
  readonly name = "TipNotFoundError";
}

export interface SendTipInput {
  id: string;
  fanWalletId: string;
  fanName: string;
  djId: string;
  djName: string;
  amountCents: number;
  message: string;
}

/**
 * Sends a tip: atomically debits the fan wallet and records a pending tip.
 * Idempotent on `id` — re-sending returns the existing tip without re-debiting.
 */
export async function sendTip(
  input: SendTipInput,
): Promise<{ tip: Tip; balanceCents: number }> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const existing = await tx.select().from(tipsTable).where(eq(tipsTable.id, input.id)).limit(1);
    if (existing[0]) {
      const wallet = await tx
        .select({ balanceCents: walletsTable.balanceCents })
        .from(walletsTable)
        .where(eq(walletsTable.id, input.fanWalletId))
        .limit(1);
      return { tip: existing[0], balanceCents: wallet[0]?.balanceCents ?? 0 };
    }

    const wallet = await tx
      .select({ balanceCents: walletsTable.balanceCents })
      .from(walletsTable)
      .where(eq(walletsTable.id, input.fanWalletId))
      .limit(1);
    const balance = wallet[0]?.balanceCents ?? 0;
    if (balance < input.amountCents) {
      throw new InsufficientFundsError("Wallet balance is too low for this tip.");
    }

    const [tip] = await tx
      .insert(tipsTable)
      .values({
        id: input.id,
        fanWalletId: input.fanWalletId,
        fanName: input.fanName,
        djId: input.djId,
        djName: input.djName,
        amountCents: input.amountCents,
        message: input.message,
        status: "pending",
      })
      .returning();

    await tx.insert(walletLedgerTable).values({
      id: `tip:${input.id}`,
      walletId: input.fanWalletId,
      amountCents: -input.amountCents,
      type: "tip_sent",
    });

    const [updated] = await tx
      .update(walletsTable)
      .set({
        balanceCents: sql`${walletsTable.balanceCents} - ${input.amountCents}`,
        updatedAt: new Date(),
      })
      .where(eq(walletsTable.id, input.fanWalletId))
      .returning({ balanceCents: walletsTable.balanceCents });

    return { tip: tip!, balanceCents: updated?.balanceCents ?? balance - input.amountCents };
  });
}

/** Accepts a pending tip (DJ claims it). No-op if already accepted. */
export async function acceptTip(id: string): Promise<Tip> {
  const db = getDb();
  const [tip] = await db
    .update(tipsTable)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(and(eq(tipsTable.id, id), eq(tipsTable.status, "pending")))
    .returning();

  if (tip) return tip;

  const existing = await db.select().from(tipsTable).where(eq(tipsTable.id, id)).limit(1);
  if (!existing[0]) throw new TipNotFoundError("Unknown tip.");
  return existing[0];
}

/** Refuses a pending tip and refunds the fan wallet. Idempotent. */
export async function refuseTip(id: string): Promise<Tip> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [tip] = await tx
      .update(tipsTable)
      .set({ status: "refused", updatedAt: new Date() })
      .where(and(eq(tipsTable.id, id), eq(tipsTable.status, "pending")))
      .returning();

    if (!tip) {
      const existing = await tx.select().from(tipsTable).where(eq(tipsTable.id, id)).limit(1);
      if (!existing[0]) throw new TipNotFoundError("Unknown tip.");
      return existing[0]; // already accepted/refused — no double refund
    }

    // Refund the fan (idempotent on ledger PK).
    await tx.insert(walletLedgerTable).values({
      id: `refund:${id}`,
      walletId: tip.fanWalletId,
      amountCents: tip.amountCents,
      type: "tip_refunded",
    });
    await tx
      .insert(walletsTable)
      .values({ id: tip.fanWalletId, balanceCents: tip.amountCents })
      .onConflictDoUpdate({
        target: walletsTable.id,
        set: {
          balanceCents: sql`${walletsTable.balanceCents} + ${tip.amountCents}`,
          updatedAt: new Date(),
        },
      });

    return tip;
  });
}

export async function listTips(filter: {
  djId?: string;
  fanWalletId?: string;
  limit?: number;
}): Promise<Tip[]> {
  const db = getDb();
  const conditions = [];
  if (filter.djId) conditions.push(eq(tipsTable.djId, filter.djId));
  if (filter.fanWalletId) conditions.push(eq(tipsTable.fanWalletId, filter.fanWalletId));

  return db
    .select()
    .from(tipsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tipsTable.createdAt))
    .limit(Math.min(filter.limit ?? 200, 500));
}

/** Total accepted earnings and amount still available to pay out for a DJ. */
export async function getDjEarnings(
  djId: string,
): Promise<{ totalCents: number; availableCents: number }> {
  const db = getDb();

  const [accepted] = await db
    .select({ total: sql<string>`coalesce(sum(${tipsTable.amountCents}), 0)` })
    .from(tipsTable)
    .where(and(eq(tipsTable.djId, djId), eq(tipsTable.status, "accepted")));

  const [payouts] = await db
    .select({ total: sql<string>`coalesce(sum(${djLedgerTable.amountCents}), 0)` })
    .from(djLedgerTable)
    .where(eq(djLedgerTable.djId, djId));

  const totalCents = Number(accepted?.total ?? 0);
  // payouts are stored as negative amounts, so adding nets them out.
  const availableCents = Math.max(0, totalCents + Number(payouts?.total ?? 0));
  return { totalCents, availableCents };
}

/** Records a Connect payout as a negative DJ ledger entry. Idempotent. */
export async function recordDjPayout(opts: {
  transferId: string;
  djId: string;
  amountCents: number;
}): Promise<void> {
  const db = getDb();
  await db
    .insert(djLedgerTable)
    .values({
      id: opts.transferId,
      djId: opts.djId,
      amountCents: -Math.abs(opts.amountCents),
      type: "payout",
    })
    .onConflictDoNothing();
}
