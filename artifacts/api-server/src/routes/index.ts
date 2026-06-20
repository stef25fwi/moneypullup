import { Router, type IRouter } from "express";
import healthRouter from "./health";
import paymentsRouter from "./payments";
import connectRouter from "./connect";

const router: IRouter = Router();

router.use(healthRouter);
router.use(paymentsRouter);
router.use(connectRouter);

export default router;
