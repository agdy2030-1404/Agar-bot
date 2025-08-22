// utils/messageScheduler.js
import cron from 'node-cron';
import botService from '../modules/bot/bot.service.js';

class MessageScheduler {
    constructor() {
        this.scheduledJob = null;
    }

    // بدء الجدولة التلقائية للرسائل
    startAutoMessageProcessing() {
        // تشغكل كل 30 دقيقة
        this.scheduledJob = cron.schedule('*/30 * * * *', async () => {
            try {
                console.log('بدء المعالجة التلقائية للرسائل...');
                
                if (!botService.browser) {
                    await botService.initBrowser();
                }

                const isLoggedIn = await botService.checkLoginStatus();
                if (!isLoggedIn) {
                    await botService.loginToAqar();
                }

                await botService.processNewMessages();
                
            } catch (error) {
                console.error('خطأ في المعالجة التلقائية للرسائل:', error);
            }
        });

        console.log('تم بدء الجدولة التلقائية للرسائل (كل 30 دقيقة)');
    }

    // إيقاف الجدولة
    stopAutoMessageProcessing() {
        if (this.scheduledJob) {
            this.scheduledJob.stop();
            console.log('تم إيقاف الجدولة التلقائية للرسائل');
        }
    }
}

export default new MessageScheduler();