// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "/default-avatar.png", // مسار افتراضي
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
