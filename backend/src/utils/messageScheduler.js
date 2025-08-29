import cron from "node-cron";
import botService from "../modules/bot/bot.service.js";

class MessageScheduler {
  constructor() {
    this.isProcessing = false;
  }

  async processMessagesAutomatically() {
    if (this.isProcessing) {
      console.log("Message processing is already in progress");
      return;
    }

    this.isProcessing = true;

    try {
      console.log("Starting automatic message processing...");

      // التحقق من أن الروبوت يعمل ومسجل الدخول
      if (!botService.browser || !botService.isLoggedIn) {
        console.log("Bot is not ready for message processing");
        return;
      }

      const result = await botService.processNewMessages();
      console.log(
        `Automatic message processing completed: ${result.success} successful, ${result.failed} failed`
      );
    } catch (error) {
      console.error("Error in automatic message processing:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  start() {
    console.log("Starting message scheduler...");

    // تشغيل كل 5 دقائق
    cron.schedule("*/5 * * * *", () => {
      this.processMessagesAutomatically();
    });

    // أيضًا التشغيل فورًا عند البدء
    this.processMessagesAutomatically();
  }
}

export default new MessageScheduler();
