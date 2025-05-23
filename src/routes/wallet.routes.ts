import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { deposit, withdraw, getWallet, transfer } from "../controllers/wallet.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getWallet);
router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

export default router;