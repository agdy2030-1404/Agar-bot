import Ad from "./ad.model.js";
import Account from "../account/account.model.js";
import AdService from "./ad.service.js";
import { AppError } from "../../utils/error.js";

export const createAd = async (req, res, next) => {
  try {
    const { accountId, title, url, platform } = req.body;
    
    // التحقق من وجود الحساب
    const account = await Account.findById(accountId);
    if (!account) {
      throw new AppError("الحساب غير موجود", 404);
    }
    
    // إنشاء إعلان جديد
    const ad = await Ad.create({
      user: req.user._id,
      account: accountId,
      title,
      url,
      platform,
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000) // بعد 24 ساعة
    });
    
    res.status(201).json({ success: true, ad });
  } catch (error) {
    next(error);
  }
};

export const refreshAd = async (req, res, next) => {
  try {
    const adId = req.params.id;
    const ad = await Ad.findById(adId);
    
    if (!ad) {
      throw new AppError("الإعلان غير موجود", 404);
    }
    
    // تنفيذ عملية التحديث
    const result = await AdService.updateAd(adId);
    
    res.status(200).json({ 
      success: true, 
      message: "تم تحديث الإعلان بنجاح",
      result
    });
  } catch (error) {
    next(error);
  }
};

export const getAds = async (req, res, next) => {
  try {
    const ads = await Ad.find({ user: req.user._id }).populate("account");
    res.status(200).json({ success: true, ads });
  } catch (error) {
    next(error);
  }
};