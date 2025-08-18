import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isRunning: { type: Boolean, default: false },
    updateInterval: { type: Number, default: 24, min: 20, max: 48 },
    lastRun: Date,
    nextRun: Date,
    platformCredentials: {
      username: String,
      password: String,
      cookies: Array, // حفظ الكوكيز
      lastLogin: Date,
    },
    stats: {
      adsUpdated: { type: Number, default: 0 },
      messagesReplied: { type: Number, default: 0 },
      lastAdUpdate: Date,
      lastMessageReply: Date,
    },
    settings: {
      autoReplyEnabled: { type: Boolean, default: true },
      replyTemplates: [
        {
          title: String,
          content: String,
        },
      ],
    },
    platforms: { type: [String], enum: ["haraj", "aqar"], default: ["haraj"] },
  },
  { timestamps: true }
);

export const Bot = mongoose.model("Bot", botSchema);
