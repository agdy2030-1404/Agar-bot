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
      enum: ["active", "inactive", "pending", "expired"],
      default: "active",
    },
    views: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    nextUpdate: {
      type: Date,
      default: () => new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 ساعة افتراضياً
    },
    updateCount: {
      type: Number,
      default: 0,
    },
    canUpdate: {
      type: Boolean,
      default: true,
    },
    updateError: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// فهرس للبحث السريع
adSchema.index({ adId: 1, userId: 1 });
adSchema.index({ status: 1, nextUpdate: 1 });
adSchema.index({ nextUpdate: 1 });

export default mongoose.model("Ad", adSchema);
