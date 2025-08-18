// models/ad.model.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  platformAdId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "expired", "pending", "rejected"],
    default: "active"
  },
  lastRenewed: {
    type: Date,
    default: Date.now
  },
  category: String,
  location: String,
  price: Number,
  images: [String],
  platform: {
    type: String,
    enum: ["haraj", "aqar", "other"],
    required: true
  },
  metadata: Object
}, { timestamps: true });

// Indexes for faster queries
adSchema.index({ userId: 1 });
adSchema.index({ platformAdId: 1 });
adSchema.index({ status: 1 });
adSchema.index({ lastRenewed: 1 });

export const Ad = mongoose.model("Ad", adSchema);