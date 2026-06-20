import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import {
  acceptTip,
  getDjEarnings,
  InsufficientFundsError,
  isDbConfigured,
  listTips,
  refuseTip,
  sendTip,
  TipNotFoundError,
} from "../lib/tips";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SendTipBody = z.object({
  id: z.string().min(1).max(128),
  fanWalletId: z.string().min(1).max(128),
  fanName: z.string().max(80).default("Fan"),
  djId: z.string().min(1).max(128),
  djName: z.string().max(120).default(""),
  amountCents: z.number().int().positive().max(100000 * 100),
  message: z.string().max(500).default(""),
});

function requireDb(res: Response): boolean {
  if (!isDbConfigured()) {
    res.status(503).json({ error: "db_not_configured" });
    return false;
  }
  return true;
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof InsufficientFundsError) {
    res.status(402).json({ error: "insufficient_funds", message: err.message });
    return;
  }
  if (err instanceof TipNotFoundError) {
    res.status(404).json({ error: "tip_not_found" });
    return;
  }
  logger.error({ err }, "Tips request failed");
  res.status(500).json({ error: "internal_error" });
}

/** Send a tip (debits the fan wallet, creates a pending tip). */
router.post("/tips", async (req: Request, res: Response) => {
  if (!requireDb(res)) return;
  const parsed = SendTipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", issues: parsed.error.issues });
    return;
  }
  try {
    const result = await sendTip(parsed.data);
    res.json(result);
  } catch (err) {
    handleError(res, err);
  }
});

/** List tips, filtered by djId and/or fanWalletId. */
router.get("/tips", async (req: Request, res: Response) => {
  if (!requireDb(res)) return;
  const djId = typeof req.query["djId"] === "string" ? req.query["djId"] : undefined;
  const fanWalletId =
    typeof req.query["fanWalletId"] === "string" ? req.query["fanWalletId"] : undefined;
  if (!djId && !fanWalletId) {
    res.status(400).json({ error: "missing_filter", message: "djId or fanWalletId is required." });
    return;
  }
  try {
    const tips = await listTips({ djId, fanWalletId });
    res.json({ tips });
  } catch (err) {
    handleError(res, err);
  }
});

/** Accept (claim) a pending tip. */
router.post("/tips/:id/accept", async (req: Request, res: Response) => {
  if (!requireDb(res)) return;
  const id = req.params["id"];
  if (typeof id !== "string") {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    res.json({ tip: await acceptTip(id) });
  } catch (err) {
    handleError(res, err);
  }
});

/** Refuse a pending tip and refund the fan. */
router.post("/tips/:id/refuse", async (req: Request, res: Response) => {
  if (!requireDb(res)) return;
  const id = req.params["id"];
  if (typeof id !== "string") {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    res.json({ tip: await refuseTip(id) });
  } catch (err) {
    handleError(res, err);
  }
});

/** A DJ's total accepted earnings and amount available to pay out. */
router.get("/djs/:djId/earnings", async (req: Request, res: Response) => {
  if (!requireDb(res)) return;
  const djId = req.params["djId"];
  if (typeof djId !== "string") {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  try {
    res.json(await getDjEarnings(djId));
  } catch (err) {
    handleError(res, err);
  }
});

export default router;
