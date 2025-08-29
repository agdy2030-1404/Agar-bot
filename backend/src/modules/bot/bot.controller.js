import botService from "./bot.service.js";
import { errorHandler } from "../../utils/error.js";

// في bot.controller.js
export const startBot = async (req, res, next) => {
  try {
    await botService.initBrowser();

    const isLoggedIn = await botService.checkLoginStatus();

    let ads = [];
    if (isLoggedIn) {
      // جلب الإعلانات تلقائياً بعد التسجيل الناجح
      ads = await botService.getMyAds();
    }

    res.status(200).json({
      success: true,
      message: "Bot started successfully",
      isRunning: true,
      isLoggedIn: isLoggedIn,
      ads: ads, // إرجاع الإعلانات
    });
  } catch (error) {
    next(errorHandler(500, `Failed to start bot: ${error.message}`));
  }
};

export const getBotStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      isRunning: !!botService.browser,
      isLoggedIn: botService.isLoggedIn, // إضافة هذا الحقل
    });
  } catch (error) {
    next(errorHandler(500, `Failed to get bot status: ${error.message}`));
  }
};

export const stopBot = async (req, res, next) => {
  try {
    const result = await botService.stop();
    res.status(200).json(result);
  } catch (error) {
    next(errorHandler(500, `Failed to stop bot: ${error.message}`));
  }
};

export const getAds = async (req, res, next) => {
  try {
    const ads = await botService.getAds();
    res.status(200).json({
      success: true,
      data: ads,
    });
  } catch (error) {
    next(errorHandler(500, `Failed to get ads: ${error.message}`));
  }
};

export const updateAd = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const result = await botService.updateAd(adId);
    res.status(200).json(result);
  } catch (error) {
    next(errorHandler(500, `Failed to update ad: ${error.message}`));
  }
};

export const fetchUserAds = async (req, res) => {
  try {
    const ads = await botService.getUserAds(global.page); // global.page لو بتخزن الصفحة بعد تسجيل الدخول
    await saveAds(ads);
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
