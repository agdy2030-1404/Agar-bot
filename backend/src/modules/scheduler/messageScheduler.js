import cron from "node-cron";
import AdService from "../ad/ad.service.js";
import Account from "../account/account.model.js";

export default class MessageScheduler {
  static start() {
    // تشغيل كل 30 دقيقة للرد على الرسائل
    cron.schedule('*/30 * * * *', async () => {
      try {
        console.log("Checking for new messages...");
        const accounts = await Account.find({ autoReplyEnabled: true });
        
        for (const account of accounts) {
          try {
            console.log(`Processing auto-reply for account: ${account.username}`);
            await AdService.autoReplyToMessages(account._id);
          } catch (error) {
            console.error(`فشل الرد التلقائي للحساب ${account._id}:`, error);
          }
        }
      } catch (error) {
        console.error("خطأ في جدولة الرسائل:", error);
      }
    });
  }
}