import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  platform: { type: String, enum: ["haraj", "sakan"], required: true },
  lastUpdated: { type: Date, default: null },
  nextUpdate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  refreshCount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["pending", "success", "failed"], 
    default: "pending" 
  },
  lastError: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model("Ad", adSchema);