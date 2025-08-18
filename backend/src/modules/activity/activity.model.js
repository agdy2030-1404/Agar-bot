// models/activity.model.js
import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["renew", "message", "error", "login", "info", "sync", "bot_start", "bot_stop"],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    // Can store additional context like ad ID, message ID, etc.
    type: mongoose.Schema.Types.Mixed
  },
  success: {
    type: Boolean,
    default: true
  },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Indexes for faster queries
activitySchema.index({ userId: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);