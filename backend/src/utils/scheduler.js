// utils/scheduler.js
import cron from 'node-cron';
import Ad from '../modules/ads/ads.model.js';
import botService from '../modules/bot/bot.service.js';

class SchedulerService {
    constructor() {
        this.scheduledJobs = new Map();
    }

    // جدولة تحديث إعلان معين
    scheduleAdUpdate(adId, updateTime) {
        const jobId = `ad-update-${adId}`;
        
        // إلغاء الجدولة السابقة إذا كانت موجودة
        this.cancelScheduledUpdate(adId);

        const now = new Date();
        const delay = updateTime.getTime() - now.getTime();

        if (delay <= 0) {
            console.log(`الوقت المحدد لتحديث الإعلان ${adId} قد مضى بالفعل`);
            return null;
        }

        const timeoutId = setTimeout(async () => {
            try {
                console.log(`تشغيل التحديث المجدول للإعلان: ${adId}`);
                await this.executeScheduledUpdate(adId);
            } catch (error) {
                console.error(`خطأ في التحديث المجدول للإعلان ${adId}:`, error);
            }
        }, delay);

        this.scheduledJobs.set(jobId, timeoutId);
        console.log(`تم جدولة تحديث الإعلان ${adId} في ${updateTime}`);

        return jobId;
    }

    // تنفيذ التحديث المجدول
    async executeScheduledUpdate(adId) {
        try {
            // البحث عن الإعلان في قاعدة البيانات
            const ad = await Ad.findOne({ adId });
            if (!ad) {
                throw new Error(`الإعلان ${adId} غير موجود`);
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

            // تحديث سجل التحديثات
            await Ad.findByIdAndUpdate(ad._id, {
                $push: {
                    updateHistory: {
                        timestamp: new Date(),
                        success: result.success,
                        message: result.message,
                        method: 'scheduled'
                    }
                },
                lastUpdateAttempt: new Date(),
                $inc: { updateCount: result.success ? 1 : 0 }
            });

            if (result.success) {
                console.log(`تم التحديث المجدول بنجاح للإعلان: ${adId}`);
                
                // جدولة التحديث التالي (20-48 ساعة)
                const nextUpdateHours = Math.floor(Math.random() * 29) + 20;
                const nextUpdateTime = new Date(Date.now() + nextUpdateHours * 60 * 60 * 1000);
                
                this.scheduleAdUpdate(adId, nextUpdateTime);
                
                await Ad.findByIdAndUpdate(ad._id, {
                    nextScheduledUpdate: nextUpdateTime
                });
            }

        } catch (error) {
            console.error(`فشل في التحديث المجدول للإعلان ${adId}:`, error);
            
            // إعادة الجدولة بعد ساعة في حالة الفشل
            const retryTime = new Date(Date.now() + 60 * 60 * 1000);
            this.scheduleAdUpdate(adId, retryTime);
        }
    }

    // إلغاء الجدولة
    cancelScheduledUpdate(adId) {
        const jobId = `ad-update-${adId}`;
        const timeoutId = this.scheduledJobs.get(jobId);
        
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.scheduledJobs.delete(jobId);
            console.log(`تم إلغاء الجدولة للإعلان: ${adId}`);
        }
    }

    // بدء جدولة جميع الإعلانات النشطة
    async scheduleAllActiveAds() {
        try {
            const activeAds = await Ad.find({ status: 'active' });
            
            for (const ad of activeAds) {
                const nextUpdateTime = ad.nextScheduledUpdate || 
                    new Date(Date.now() + Math.floor(Math.random() * 29 + 20) * 60 * 60 * 1000);
                
                this.scheduleAdUpdate(ad.adId, nextUpdateTime);
            }
            
            console.log(`تم جدولة ${activeAds.length} إعلان نشط`);
        } catch (error) {
            console.error('خطأ في جدولة الإعلانات النشطة:', error);
        }
    }
}

export default new SchedulerService();