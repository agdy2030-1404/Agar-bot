// models/stats.model.js
import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  ads: {
    total: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    expired: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastUpdated: Date
  },
  messages: {
    total: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    lastUpdated: Date
  },
  bot: {
    uptime: { type: Number, default: 0 }, // in minutes
    lastActivity: Date,
    nextRun: Date,
    successRate: { type: Number, default: 100 } // percentage
  },
  trends: {
    adViews: { type: Number, default: 0 }, // percentage change
    messageResponse: { type: Number, default: 0 } // percentage change
  }
}, { timestamps: true });

export const Stats = mongoose.model("Stats", statsSchema);