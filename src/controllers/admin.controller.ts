import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";

// View flagged transactions
export const flaggedTransactions = async (req: Request, res: Response) => {
  const flagged = await Transaction.find({ flagged: true, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(flagged);
};

// Aggregate total user balances
export const userBalances = async (req: Request, res: Response) => {
  const balances = await Wallet.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$currency",
        total: { $sum: "$balance" }
      }
    }
  ]);
  res.json(balances);
};

// Top users by balance or transaction volume
export const topUsers = async (req: Request, res: Response) => {
  const by = req.query.by || "balance";
  if (by === "balance") {
    const top = await Wallet.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$user",
          total: { $sum: "$balance" }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);
    // Populate usernames
    const users = await User.find({ _id: { $in: top.map(t => t._id) } });
    res.json(
      top.map(t => ({
        username: users.find(u => String(u._id) === String(t._id))?.username,
        total: t.total
      }))
    );
  } else {
    // by transaction count
    const top = await Transaction.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$from",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    // Populate usernames
    const users = await User.find({ _id: { $in: top.map(t => t._id) } });
    res.json(
      top.map(t => ({
        username: users.find(u => String(u._id) === String(t._id))?.username,
        count: t.count
      }))
    );
  }
};