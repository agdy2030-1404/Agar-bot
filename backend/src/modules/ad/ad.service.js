import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import Account from "../account/account.model.js";
import Ad from "./ad.model.js";
import { BROWSER_SETTINGS, HARAJ_LOGIN_URL, SAKAN_LOGIN_URL } from "../../config/puppeteer.config.js";
import Activity from "../activity/activity.model.js";

puppeteer.use(StealthPlugin());

export default class AdService {
  static async updateAd(adId) {
    const ad = await Ad.findById(adId).populate("account");
    if (!ad) throw new Error("Ad not found");
    
    const browser = await puppeteer.launch(BROWSER_SETTINGS);
    const page = await browser.newPage();
    
    try {
      // تسجيل الدخول باستخدام ملفات تعريف الارتباط إذا متوفرة
      if (ad.account.cookies) {
        await page.setCookie(...JSON.parse(ad.account.cookies));
      }
      
      // الانتقال لصفحة الإعلان
      await page.goto(ad.url, { waitUntil: "networkidle2", timeout: 60000 });
      
      // محاولة العثور على زر التحديث
      const refreshButton = await page.waitForSelector(
        'button:has-text("تحديث"), button:has-text("تجديد")', 
        { timeout: 10000 }
      );
      
      await refreshButton.click();
      console.log(`تم تحديث الإعلان: ${ad.title}`);
      
      // تحديث حالة الإعلان
      ad.lastUpdated = new Date();
      ad.status = "success";
      ad.lastError = null;
      await ad.save();
      
      // تسجيل النشاط
      await this.logActivity(
        ad.user,
        "ad_updated",
        `تم تحديث الإعلان: ${ad.title}`
      );
      
      // حفظ ملفات تعريف الارتباط الجديدة
      const cookies = await page.cookies();
      ad.account.cookies = JSON.stringify(cookies);
      await ad.account.save();
      
      return { success: true };
    } catch (error) {
      ad.status = "failed";
      ad.lastError = error.message;
      await ad.save();
      
      await this.logActivity(
        ad.user,
        "ad_update_failed",
        `فشل تحديث الإعلان: ${error.message}`
      );
      
      throw error;
    } finally {
      await browser.close();
    }
  }

  static async autoReplyToMessages(accountId) {
    const account = await Account.findById(accountId);
    if (!account) throw new Error("Account not found");
    
    const browser = await puppeteer.launch(BROWSER_SETTINGS);
    const page = await browser.newPage();
    
    try {
      // تسجيل الدخول باستخدام ملفات تعريف الارتباط
      if (account.cookies) {
        await page.setCookie(...JSON.parse(account.cookies));
      }
      
      // الانتقال لصفحة الرسائل
      const messagesUrl = account.platform === "haraj" 
        ? "https://haraj.sa/messages" 
        : "https://sakan.sa/messages";
      
      await page.goto(messagesUrl, { waitUntil: "networkidle2", timeout: 60000 });
      
      // البحث عن الرسائل الجديدة
      const newMessages = await page.$$(".message-item.unread");
      
      for (const message of newMessages) {
        try {
          await message.click();
          await page.waitForSelector(".reply-box", { timeout: 5000 });
          
          // كتابة الرد
          await page.type(".reply-box", account.autoReplyMessage);
          
          // إرسال الرد
          const sendButton = await page.$(".send-button");
          await sendButton.click();
          
          // تسجيل النشاط
          await this.logActivity(
            account.user,
            "auto_reply_sent",
            `تم إرسال رد تلقائي من الحساب: ${account.username}`
          );
          
          await page.waitForTimeout(2000);
        } catch (error) {
          console.error("Failed to reply to message:", error);
        }
      }
      
      // حفظ ملفات تعريف الارتباط الجديدة
      const cookies = await page.cookies();
      account.cookies = JSON.stringify(cookies);
      await account.save();
      
      return { success: true, repliesSent: newMessages.length };
    } catch (error) {
      console.error("Auto-reply error:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  static async logActivity(userId, action, details) {
    await Activity.create({
      user: userId,
      action,
      details
    });
  }
}