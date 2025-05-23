import { Request, Response } from "express";
import Transaction from "../models/Transaction";

export const getHistory = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const transactions = await Transaction.find({
    $or: [{ from: user._id }, { to: user._id }],
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(transactions);
};