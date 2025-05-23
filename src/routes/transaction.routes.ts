import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getHistory } from "../controllers/transaction.controller";

const router = Router();

router.use(authMiddleware);

router.get("/history", getHistory);

export default router;