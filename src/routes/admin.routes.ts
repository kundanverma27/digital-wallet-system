import { Router } from "express";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware";
import { flaggedTransactions, userBalances, topUsers } from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get("/flagged-transactions", flaggedTransactions);
router.get("/user-balances", userBalances);
router.get("/top-users", topUsers);

export default router;