// modules/ads/ads.route.js
import express from "express";
import * as adsController from "./ads.controller.js";
import { verifyToken } from "../../utils/verifyUser.js";

const router = express.Router();

// جلب الإعلانات من الموقع وحفظها
router.get("/fetch", verifyToken, adsController.fetchUserAds);

// الحصول على الإعلانات المحفوظة
router.get("/", verifyToken, adsController.getUserAds);

// الحصول على تفاصيل إعلان معين
router.get("/:adId", verifyToken, adsController.getAdDetails);

// تحديث حالة الإعلان
router.patch("/:adId/status", verifyToken, adsController.updateAdStatus);

// حذف إعلان
router.delete("/:adId", verifyToken, adsController.deleteAd);

router.post("/:adId/update", verifyToken, adsController.updateSingleAd);

// جدولة تحديثات تلقائية
router.post("/schedule-updates", verifyToken, adsController.scheduleAdUpdates);

// إضافة إعلان إلى طابور التحديث
router.post("/:adId/queue", verifyToken, adsController.addToUpdateQueue);

// الحصول على طابور التحديث
router.get("/queue/status", verifyToken, adsController.getUpdateQueue);

export default router;
