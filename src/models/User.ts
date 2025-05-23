import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isDeleted: boolean;
}

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin:  { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IUser>("User", UserSchema);