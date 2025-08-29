import cron from 'node-cron';
import Ad from '../modules/ads/ads.model.js';
import botService from '../modules/bot/bot.service.js';

class Scheduler {
  constructor() {
    this.scheduledJobs = new Map();
  }

  async scheduleAdUpdates() {
    try {
      // إيقاف جميع المهام القديمة
      this.stopAllJobs();

      // جلب الإعلانات التي تحتاج للتحديث
      const adsToUpdate = await Ad.find({
        status: 'active',
        canUpdate: true,
        nextUpdate: { $lte: new Date() }
      });

      console.log(`Scheduling updates for ${adsToUpdate.length} ads`);

      for (const ad of adsToUpdate) {
        this.scheduleSingleAd(ad);
      }
    } catch (error) {
      console.error('Error scheduling ad updates:', error);
    }
  }

  scheduleSingleAd(ad) {
    // إنشاء وقت عشوائي بين 20-48 ساعة
    const randomHours = Math.floor(Math.random() * 29) + 20; // 20-48 ساعة
    const updateTime = new Date(Date.now() + randomHours * 60 * 60 * 1000);

    // جدولة المهمة
    const job = cron.schedule(updateTime, async () => {
      try {
        console.log(`Running scheduled update for ad: ${ad.adId}`);
        
        // التحقق من أن الروبوت يعمل
        if (!botService.browser || !botService.isLoggedIn) {
          console.log('Bot not running, skipping update');
          return;
        }

        // تنفيذ التحديث
        const result = await botService.updateAd(ad.adId);

        if (result.success) {
          // تحديث وقت التحديث التالي
          const nextRandomHours = Math.floor(Math.random() * 29) + 20;
          const nextUpdate = new Date(Date.now() + nextRandomHours * 60 * 60 * 1000);

          await Ad.findByIdAndUpdate(ad._id, {
            lastUpdated: new Date(),
            nextUpdate: nextUpdate,
            updateCount: ad.updateCount + 1,
            updateError: ''
          });

          console.log(`Scheduled update completed for ad: ${ad.adId}`);
        }
      } catch (error) {
        console.error(`Scheduled update failed for ad ${ad.adId}:`, error);
        
        // تحديث سجل الخطأ
        await Ad.findByIdAndUpdate(ad._id, {
          updateError: error.message,
          canUpdate: false // تعطيل التحديث التلقائي حتى يتم التصحيح
        });
      }
    });

    this.scheduledJobs.set(ad.adId, job);
    console.log(`Scheduled update for ad ${ad.adId} at ${updateTime}`);
  }

  stopAllJobs() {
    for (const [adId, job] of this.scheduledJobs) {
      job.stop();
      console.log(`Stopped job for ad: ${adId}`);
    }
    this.scheduledJobs.clear();
  }

  stopJob(adId) {
    const job = this.scheduledJobs.get(adId);
    if (job) {
      job.stop();
      this.scheduledJobs.delete(adId);
      console.log(`Stopped job for ad: ${adId}`);
    }
  }

  // تشغيل المجدول عند بدء التشغيل
  async start() {
    console.log('Starting scheduler...');
    await this.scheduleAdUpdates();
    
    // تحديث الجدول كل ساعة
    setInterval(() => {
      this.scheduleAdUpdates();
    }, 60 * 60 * 1000);
  }
}

export default new Scheduler();