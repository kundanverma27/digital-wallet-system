import mongoose, { Schema, Document } from "mongoose";

export type TransactionType = "deposit" | "withdrawal" | "transfer";

export interface ITransaction extends Document {
  from?: mongoose.Types.ObjectId;
  to?: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  flagged: boolean;
  flagReason?: string;
  isDeleted: boolean;
}

const TransactionSchema = new Schema({
  from:      { type: Schema.Types.ObjectId, ref: "User" },
  to:        { type: Schema.Types.ObjectId, ref: "User" },
  type:      { type: String, enum: ["deposit", "withdrawal", "transfer"], required: true },
  amount:    { type: Number, required: true },
  currency:  { type: String, required: true },
  flagged:   { type: Boolean, default: false },
  flagReason: { type: String },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);