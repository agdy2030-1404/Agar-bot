// modules/ads/ads.controller.js
import Ad from "./ads.model.js";
import botService from "../bot/bot.service.js";
import { errorHandler } from "../../utils/error.js";

export const fetchUserAds = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // تشغيل الروبوت وجلب الإعلانات
    await botService.initBrowser();
    const isLoggedIn = await botService.checkLoginStatus();

    if (!isLoggedIn) {
      await botService.loginToAqar();
    }

    const ads = await botService.getMyAds();

    // حفظ الإعلانات في قاعدة البيانات
    const savedAds = [];

    for (const adData of ads) {
      try {
        // التحقق مما إذا كان الإعلان موجوداً بالفعل
        const existingAd = await Ad.findOne({
          adId: adData.adId,
          userId,
        });

        if (existingAd) {
          // تحديث الإعلان الموجود
          const updatedAd = await Ad.findByIdAndUpdate(
            existingAd._id,
            {
              ...adData,
              lastUpdated: new Date(),
              userId,
            },
            { new: true }
          );
          savedAds.push(updatedAd);
        } else {
          // إنشاء إعلان جديد
          const newAd = new Ad({
            ...adData,
            userId,
          });
          const savedAd = await newAd.save();
          savedAds.push(savedAd);
        }
      } catch (dbError) {
        console.error(`Error saving ad ${adData.adId}:`, dbError);
        // الاستمرار مع الإعلانات الأخرى رغم الخطأ
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
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status && status !== "all") {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const ads = await Ad.paginate(query, options);

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

    // إذا كان الإعلان قديماً، يمكن جلب التفاصيل حديثاً
    const isOld = new Date() - ad.lastUpdated > 24 * 60 * 60 * 1000; // أقدم من 24 ساعة

    if (isOld) {
      try {
        await botService.initBrowser();
        await botService.checkLoginStatus();

        const details = await botService.getAdDetails(adId);

        // تحديث الإعلان بالتفاصيل الجديدة
        const updatedAd = await Ad.findOneAndUpdate(
          { adId, userId },
          {
            ...details,
            lastUpdated: new Date(),
            views: parseInt(details.views) || ad.views,
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          data: updatedAd,
        });
      } catch (updateError) {
        console.error("Error updating ad details:", updateError);
        // إرجاع البيانات القديمة في حالة فشل التحديث
      }
    }

    res.status(200).json({
      success: true,
      data: ad,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب تفاصيل الإعلان: ${error.message}`));
  }
};

export const updateAdStatus = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ["active", "draft", "expired", "pending"];
    if (!validStatuses.includes(status)) {
      return next(errorHandler(400, "حالة غير صالحة"));
    }

    const ad = await Ad.findOneAndUpdate(
      { adId, userId },
      { status, lastUpdated: new Date() },
      { new: true }
    );

    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    res.status(200).json({
      success: true,
      message: "تم تحديث حالة الإعلان بنجاح",
      data: ad,
    });
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث حالة الإعلان: ${error.message}`));
  }
};

export const deleteAd = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    const ad = await Ad.findOneAndDelete({ adId, userId });

    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    res.status(200).json({
      success: true,
      message: "تم حذف الإعلان بنجاح",
    });
  } catch (error) {
    next(errorHandler(500, `فشل في حذف الإعلان: ${error.message}`));
  }
};

export const updateSingleAd = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const userId = req.user.id;

    // التحقق من وجود الإعلان
    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // تشغيل الروبوت إذا لم يكن نشطاً
    if (!botService.browser) {
      await botService.initBrowser();
    }

    // التحقق من تسجيل الدخول
    const isLoggedIn = await botService.checkLoginStatus();
    if (!isLoggedIn) {
      await botService.loginToAqar();
    }

    // تحديث الإعلان
    const result = await botService.updateAd(adId);

    if (result.success) {
      // تحديث وقت التحديث الأخير في قاعدة البيانات
      await Ad.findOneAndUpdate(
        { adId, userId },
        {
          lastUpdated: new Date(),
          $inc: { updateCount: 1 },
        }
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          adId,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    next(errorHandler(500, `فشل في تحديث الإعلان: ${error.message}`));
  }
};

export const scheduleAdUpdates = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { minHours = 20, maxHours = 48 } = req.body;

    // جلب الإعلانات النشطة
    const activeAds = await Ad.find({
      userId,
      status: "active",
    });

    if (activeAds.length === 0) {
      return next(errorHandler(404, "لا توجد إعلانات نشطة"));
    }

    // تشغيل الروبوت إذا لم يكن نشطاً
    if (!botService.browser) {
      await botService.initBrowser();
    }

    // التحقق من تسجيل الدخول
    const isLoggedIn = await botService.checkLoginStatus();
    if (!isLoggedIn) {
      await botService.loginToAqar();
    }

    // جدولة التحديثات
    botService.scheduleAutoUpdates(activeAds, minHours, maxHours);

    res.status(200).json({
      success: true,
      message: `تم جدولة تحديث ${activeAds.length} إعلان`,
      data: {
        scheduledCount: activeAds.length,
        timeRange: `${minHours}-${maxHours} ساعات`,
        nextUpdate: new Date(
          Date.now() + minHours * 60 * 60 * 1000
        ).toISOString(),
      },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جدولة التحديثات: ${error.message}`));
  }
};

export const addToUpdateQueue = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const { priority = "normal" } = req.body;
    const userId = req.user.id;

    // التحقق من وجود الإعلان
    const ad = await Ad.findOne({ adId, userId });
    if (!ad) {
      return next(errorHandler(404, "الإعلان غير موجود"));
    }

    // إضافة إلى طابور التحديث
    botService.addToUpdateQueue(adId, priority);

    res.status(200).json({
      success: true,
      message: "تم إضافة الإعلان إلى طابور التحديث",
      data: {
        adId,
        priority,
        queuePosition: botService.updateQueue.length,
      },
    });
  } catch (error) {
    next(
      errorHandler(500, `فشل في إضافة الإعلان إلى الطابور: ${error.message}`)
    );
  }
};

export const getUpdateQueue = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        queue: botService.updateQueue,
        isProcessing: botService.isProcessingQueue,
        queueLength: botService.updateQueue.length,
      },
    });
  } catch (error) {
    next(errorHandler(500, `فشل في جلب طابور التحديث: ${error.message}`));
  }
};
