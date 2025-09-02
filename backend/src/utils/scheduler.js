import Ad from "../modules/ads/ads.model.js";
import botService from "../modules/bot/bot.service.js";

class Scheduler {
  constructor() {
    this.scheduledTimeouts = new Map();
  }

  // استبدال دالة scheduleAdUpdates بالنسخة المحسنة
  async scheduleAdUpdates() {
    try {
      // إيقاف جميع المهام القديمة
      this.stopAllJobs();

      // جلب الإعلانات التي تحتاج للتحديث
      const adsToUpdate = await Ad.find({
        status: "active",
        canUpdate: true,
        nextUpdate: { $lte: new Date() },
      });

      console.log(`Scheduling updates for ${adsToUpdate.length} ads`);

      for (const ad of adsToUpdate) {
        // إضافة عشوائية في وقت التنفيذ (0-30 دقيقة)
        const randomDelay = Math.floor(Math.random() * 30 * 60 * 1000);
        const scheduledTime = new Date(Date.now() + randomDelay);

        console.log(
          `Scheduling ad ${ad.adId} with ${
            randomDelay / 1000 / 60
          } minutes delay`
        );

        this.scheduleSingleAd(ad, randomDelay);
      }
    } catch (error) {
      console.error("Error scheduling ad updates:", error);
    }
  }

  // تعديل دالة scheduleSingleAd لقبول التأخير
  scheduleSingleAd(ad, delay = 0) {
    // حساب الوقت المتبقي حتى التحديث (بالميلي ثانية)
    const timeUntilUpdate = Math.max(0, ad.nextUpdate - new Date()) + delay;

    // إذا كان الوقت قد فات، نفذ التحديث فوراً مع تأخير عشوائي
    const actualDelay =
      timeUntilUpdate <= 0
        ? Math.floor(Math.random() * 5 * 60 * 1000) // 0-5 دقائق للتحديثات المتأخرة
        : timeUntilUpdate;

    // جدولة المهمة باستخدام setTimeout
    const timeoutId = setTimeout(() => {
      this.executeAdUpdate(ad);
    }, actualDelay);

    this.scheduledTimeouts.set(ad.adId, timeoutId);
    console.log(
      `Scheduled update for ad ${ad.adId} in ${Math.round(
        actualDelay / 1000 / 60
      )} minutes`
    );
  }

  // تحسين دالة executeAdUpdate
  async executeAdUpdate(ad) {
    try {
      console.log(`Running scheduled update for ad: ${ad.adId}`);

      // التحقق من أن الروبوت يعمل
      if (!botService.browser || !botService.isLoggedIn) {
        console.log("Bot not running, attempting to restart...");

        try {
          await botService.ensureBotRunning();
        } catch (restartError) {
          console.log("Failed to restart bot, rescheduling in 30 minutes");
          // إعادة الجدولة بعد 30 دقيقة
          setTimeout(() => {
            this.scheduleSingleAd(ad, 30 * 60 * 1000);
          }, 30 * 60 * 1000);
          return;
        }
      }

      // تنفيذ التحديث
      const result = await botService.updateAd(ad.adId);

      if (result.success) {
        // تحديث وقت التحديث التالي (بشكل عشوائي بين 20-48 ساعة)
        const nextRandomHours = Math.floor(Math.random() * 29) + 20;
        const nextUpdate = new Date(
          Date.now() + nextRandomHours * 60 * 60 * 1000
        );

        await Ad.findByIdAndUpdate(ad._id, {
          lastUpdated: new Date(),
          nextUpdate: nextUpdate,
          updateCount: ad.updateCount + 1,
          updateError: "",
        });

        console.log(`Scheduled update completed for ad: ${ad.adId}`);

        // جدولة التحديث التالي
        this.scheduleSingleAd({ ...ad.toObject(), nextUpdate });
      }
    } catch (error) {
      console.error(`Scheduled update failed for ad ${ad.adId}:`, error);

      // تحديد وقت إعادة المحاولة (1-6 ساعات)
      const retryDelay =
        Math.floor(Math.random() * 5 * 60 * 60 * 1000) + 60 * 60 * 1000;

      // تحديث سجل الخطأ
      await Ad.findByIdAndUpdate(ad._id, {
        updateError: error.message.substring(0, 200),
        nextUpdate: new Date(Date.now() + retryDelay),
      });

      // إعادة الجدولة
      this.scheduleSingleAd(ad, retryDelay);
    }
  }

  stopAllJobs() {
    for (const [adId, timeoutId] of this.scheduledTimeouts) {
      clearTimeout(timeoutId);
      console.log(`Stopped job for ad: ${adId}`);
    }
    this.scheduledTimeouts.clear();
  }

  stopJob(adId) {
    const timeoutId = this.scheduledTimeouts.get(adId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledTimeouts.delete(adId);
      console.log(`Stopped job for ad: ${adId}`);
    }
  }

  // تشغيل المجدول عند بدء التشغيل
  async start() {
    console.log("Starting scheduler...");
    await this.scheduleAdUpdates();

    // تحديث الجدول كل ساعة للتحقق من الإعلانات الجديدة
    setInterval(() => {
      this.scheduleAdUpdates();
    }, 60 * 60 * 1000);
  }
}

export default new Scheduler();