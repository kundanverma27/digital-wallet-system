import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import walletRoutes from "./routes/wallet.routes";
import transactionRoutes from "./routes/transaction.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;