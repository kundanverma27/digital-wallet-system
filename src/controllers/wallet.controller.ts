import { Request, Response } from "express";
import Wallet from "../models/Wallet";
import User from "../models/User";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";

// Deposit
export const deposit = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount, currency = "USD" } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Invalid deposit amount" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let wallet = await Wallet.findOne({ user: user._id, currency }).session(session);
    if (!wallet) {
      wallet = await Wallet.create([{ user: user._id, balance: 0, currency }], { session });
      wallet = wallet[0];
    }
    wallet.balance += amount;
    await wallet.save({ session });
    await Transaction.create([{ to: user._id, type: "deposit", amount, currency }], { session });
    await session.commitTransaction();
    res.json({ message: "Deposit successful", balance: wallet.balance });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Deposit failed" });
  } finally {
    session.endSession();
  }
};

// Withdraw
export const withdraw = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { amount, currency = "USD" } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Invalid withdrawal amount" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let wallet = await Wallet.findOne({ user: user._id, currency }).session(session);
    if (!wallet || wallet.balance < amount)
      throw new Error("Insufficient balance");
    wallet.balance -= amount;
    await wallet.save({ session });
    // Flag large withdrawal
    let flagged = false;
    let flagReason = undefined;
    if (amount > 1000) {
      flagged = true;
      flagReason = "Large withdrawal";
    }
    await Transaction.create([{ from: user._id, type: "withdrawal", amount, currency, flagged, flagReason }], { session });

    await session.commitTransaction();
    res.json({ message: "Withdrawal successful", balance: wallet.balance });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message || "Withdrawal failed" });
  } finally {
    session.endSession();
  }
};

// Transfer
export const transfer = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { toUsername, amount, currency = "USD" } = req.body;
  if (amount <= 0) return res.status(400).json({ message: "Invalid transfer amount" });
  if (!toUsername) return res.status(400).json({ message: "Recipient required" });
  if (toUsername === user.username) return res.status(400).json({ message: "Cannot transfer to yourself" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const toUser = await User.findOne({ username: toUsername }).session(session);
    if (!toUser || toUser.isDeleted) throw new Error("Recipient not found");

    let fromWallet = await Wallet.findOne({ user: user._id, currency }).session(session);
    let toWallet = await Wallet.findOne({ user: toUser._id, currency }).session(session);
    if (!fromWallet || fromWallet.balance < amount)
      throw new Error("Insufficient balance");

    if (!toWallet) {
      toWallet = await Wallet.create([{ user: toUser._id, balance: 0, currency }], { session });
      toWallet = toWallet[0];
    }
    fromWallet.balance -= amount;
    toWallet.balance += amount;

    await fromWallet.save({ session });
    await toWallet.save({ session });

    // Check for rapid transfers (simple fraud detection)
    const recent = await Transaction.countDocuments({
      from: user._id,
      type: "transfer",
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // last 5 minutes
    }).session(session);

    let flagged = false;
    let flagReason = undefined;
    if (recent >= 3) {
      flagged = true;
      flagReason = "Multiple transfers in short period";
    }

    await Transaction.create([{
      from: user._id,
      to: toUser._id,
      type: "transfer",
      amount,
      currency,
      flagged,
      flagReason
    }], { session });

    await session.commitTransaction();
    res.json({ message: "Transfer successful", balance: fromWallet.balance });
  } catch (err: any) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message || "Transfer failed" });
  } finally {
    session.endSession();
  }
};

// Get Wallet
export const getWallet = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const wallets = await Wallet.find({ user: user._id, isDeleted: false });
  res.json(wallets.map(w => ({
    currency: w.currency,
    balance: w.balance
  })));
};