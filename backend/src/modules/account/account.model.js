import mongoose from "mongoose";
import { encrypt } from "../../utils/helpers.js";

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform: { type: String, enum: ["haraj", "sakan"], required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  autoReplyEnabled: { type: Boolean, default: true },
  autoReplyMessage: { 
    type: String, 
    default: "شكراً لاهتمامك! سنتواصل معك قريباً." 
  },
  cookies: { type: String, default: "" },
  lastLogin: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ["active", "disabled", "invalid"], 
    default: "active" 
  }
}, { timestamps: true });

// تشفير كلمة المرور قبل الحفظ
accountSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = encrypt(this.password);
  }
  next();
});

export default mongoose.model("Account", accountSchema);