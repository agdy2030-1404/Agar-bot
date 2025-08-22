// modules/ads/ads.model.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
  {
    adId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "",
    },
    rooms: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "draft", "expired", "pending"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: Map,
      of: String,
      default: {},
    },
    features: [
      {
        type: String,
      },
    ],
    updateCount: {
      type: Number,
      default: 0,
    },
    lastUpdateAttempt: {
      type: Date,
      default: null,
    },
    updateHistory: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        success: {
          type: Boolean,
          default: false,
        },
        message: String,
        method: String,
      },
    ],
    nextScheduledUpdate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// فهرس للبحث السريع
adSchema.index({ adId: 1, userId: 1 });
adSchema.index({ userId: 1, status: 1 });

const Ad = mongoose.model("Ad", adSchema);

export default Ad;
