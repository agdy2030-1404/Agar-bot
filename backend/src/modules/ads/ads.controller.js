import Ad from "./ads.model.js";
import { errorHandler } from "../../utils/error.js";
import botService from "../bot/bot.service.js";

export const fetchUserAds = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // جلب الإعلانات من الموقع
    const ads = await botService.getMyAds();

    // حفظ الإعلانات في قاعدة البيانات
    const savedAds = [];
    for (const adData of ads) {
      try {
        // التحقق إذا كان الإعلان موجوداً بالفعل
        let ad = await Ad.findOne({ adId: adData.adId, userId });

        if (ad) {
          // تحديث الإعلان الموجود
          ad = await Ad.findOneAndUpdate(
            { adId: adData.adId, userId },
            { ...adData, lastUpdated: new Date() },
            { new: true }
          );
        } else {
          // إنشاء إعلان جديد
          ad = await Ad.create({
            ...adData,
            userId,
            views: 0,
          });
        }

        savedAds.push(ad);
      } catch (dbError) {
        console.error(`Error saving ad ${adData.adId}:`, dbError);
      }
    }

    res.status(200).json({
      success: true,
      message: `تم جلب ${savedAds.length} إعلان بنجاح`,
      data: savedAds,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الإعلانات: ${error.message}`));
  }
};

export const getUserAds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ads = await Ad.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: ads,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب الإعلانات: ${error.message}`));
  }
};

export const getAdDetails = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب تفاصيل الإعلان: ${error.message}`));
  }
};

export const updateAd = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    // التحقق من وجود الإعلان
    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // تنفيذ التحديث
    const result = await botService.updateAd(adId);

    if (result.success) {
      // تحديث قاعدة البيانات
      const nextRandomHours = Math.floor(Math.random() * 29) + 20;
      const nextUpdate = new Date(
        Date.now() + nextRandomHours * 60 * 60 * 1000
      );

      const updatedAd = await Ad.findOneAndUpdate(
        { adId, userId },
        {
          lastUpdated: new Date(),
          nextUpdate: nextUpdate,
          updateCount: ad.updateCount + 1,
          updateError: "",
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "تم تحديث الإعلان بنجاح",
        data: updatedAd,
      });
    } else {
      throw new Error("فشل في تحديث الإعلان");
    }
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث الإعلان: ${error.message}`));
  }
};

export const scheduleAdUpdate = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // جدولة التحديث
    scheduler.scheduleSingleAd(ad);

    res.status(200).json({
      success: true,
      message: "تم جدولة التحديث بنجاح",
      nextUpdate: ad.nextUpdate,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جدولة التحديث: ${error.message}`));
  }
};

