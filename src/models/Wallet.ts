import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  isDeleted: boolean;
}

const WalletSchema = new Schema({
  user:     { type: Schema.Types.ObjectId, ref: "User", required: true },
  balance:  { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IWallet>("Wallet", WalletSchema);