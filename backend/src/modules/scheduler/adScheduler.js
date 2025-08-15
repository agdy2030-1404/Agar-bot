import Ad from "../ad/ad.model.js";
import AdService from "../ad/ad.service.js";
import Account from "../account/account.model.js";
import cron from "node-cron";
import { randomInt } from "../../utils/helpers.js";

class AdScheduler {
  static async scheduleAdUpdates() {
    cron.schedule("*/30 * * * *", async () => {
      try {
        console.log("Running ad update scheduler...");
        const ads = await Ad.find({
          nextUpdate: { $lte: new Date() },
          isActive: true
        }).populate("account");
        
        for (const ad of ads) {
          try {
            console.log(`Updating ad: ${ad.title}`);
            await AdService.updateAd(ad._id);
            
            // جدولة التحديث التالي (20-48 ساعة)
            const hours = randomInt(20, 48);
            ad.nextUpdate = new Date(Date.now() + hours * 60 * 60 * 1000);
            ad.refreshCount += 1;
            await ad.save();
          } catch (error) {
            ad.status = "failed";
            ad.lastError = error.message;
            await ad.save();
            console.error(`Failed to update ad ${ad._id}:`, error);
          }
        }
      } catch (error) {
        console.error("Ad scheduler error:", error);
      }
    });
  }
}

export function startSchedulers() {
  AdScheduler.scheduleAdUpdates();
  console.log("✅ Ad scheduler started successfully");
}