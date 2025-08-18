import { Ad } from "./ads.model.js";
import { errorHandler } from "../../utils/error.js";
import puppeteer from "puppeteer";

// Helper: map platform status to internal status
function mapStatus(platformStatus) {
  const statusMap = {
    "نشط": "active",
    "منتهي": "expired",
    "معلق": "pending",
    "مرفوض": "rejected"
  };
  return statusMap[platformStatus] || platformStatus;
}

// Helper: parse Arabic date strings
function parseArabicDate(dateString) {
  const matches = dateString.match(/(\d+) (\S+)/);
  if (!matches) return new Date();
  const value = parseInt(matches[1]);
  const unit = matches[2];
  const now = new Date();
  if (unit.includes("ساعة")) now.setHours(now.getHours() - value);
  else if (unit.includes("يوم")) now.setDate(now.getDate() - value);
  else if (unit.includes("أسبوع")) now.setDate(now.getDate() - value * 7);
  return now;
}

// Fetch user's ads with pagination
export const getUserAds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, platform } = req.query;

    const skip = (page - 1) * limit;
    const query = { userId };
    if (status) query.status = status;
    if (platform) query.platform = platform;

    const [ads, total] = await Promise.all([
      Ad.find(query).sort({ lastRenewed: -1 }).skip(skip).limit(limit),
      Ad.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      ads,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalAds: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Renew a single ad (Haraj or Aqar)
export const renewAd = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const ad = await Ad.findOne({ _id: id, userId });
    if (!ad) return next(errorHandler(404, "Ad not found"));

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (req.user.platformCredentials?.[ad.platform]?.cookies) {
      await page.setCookie(...req.user.platformCredentials[ad.platform].cookies);
    }

    await page.goto(ad.url);

    const renewButton = await page.$('button:has-text("تجديد")') ||
                        await page.$('button:has-text("Renew")');
    if (!renewButton) {
      await browser.close();
      return next(errorHandler(400, "Renew button not found"));
    }

    await renewButton.click();
    await page.waitForTimeout(2000);

    const updatedAd = await Ad.findByIdAndUpdate(
      id,
      { 
        status: "active",
        lastRenewed: new Date(),
        $inc: { views: -Math.floor(ad.views * 0.2) }
      },
      { new: true }
    );

    await browser.close();

    res.status(200).json({ success: true, ad: updatedAd });
  } catch (error) {
    next(error);
  }
};

// Renew all eligible ads
export const renewAllAds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const adsToRenew = await Ad.find({
      userId,
      status: { $in: ["active", "pending"] },
      lastRenewed: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (adsToRenew.length === 0) return res.status(200).json({
      success: true,
      renewedCount: 0,
      message: "No ads eligible for renewal"
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let renewedCount = 0;
    for (const ad of adsToRenew) {
      try {
        if (req.user.platformCredentials?.[ad.platform]?.cookies) {
          await page.setCookie(...req.user.platformCredentials[ad.platform].cookies);
        }
        await page.goto(ad.url);
        const renewButton = await page.$('button:has-text("تجديد")') ||
                            await page.$('button:has-text("Renew")');
        if (renewButton) {
          await renewButton.click();
          await page.waitForTimeout(3000);
          await Ad.findByIdAndUpdate(ad._id, {
            status: "active",
            lastRenewed: new Date(),
            $inc: { views: -Math.floor(ad.views * 0.2) }
          });
          renewedCount++;
        }
      } catch (err) { console.error(err); continue; }
    }

    await browser.close();

    res.status(200).json({ success: true, renewedCount, totalEligible: adsToRenew.length });
  } catch (error) {
    next(error);
  }
};

// Sync ads from a platform
export const syncAds = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { platform } = req.query;
    if (!platform) return next(errorHandler(400, "Platform required"));

    const urlMap = { haraj: "https://haraj.com.sa/profile/ads", aqar: "https://aqar.fm/profile/ads" };
    const url = urlMap[platform];
    if (!url) return next(errorHandler(400, "Invalid platform"));

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (req.user.platformCredentials?.[platform]?.cookies) {
      await page.setCookie(...req.user.platformCredentials[platform].cookies);
    }

    await page.goto(url);

    const platformAds = await page.evaluate(() => {
      const ads = [];
      document.querySelectorAll(".ad-item").forEach(item => {
        ads.push({
          platformAdId: item.dataset.adId,
          title: item.querySelector(".ad-title")?.innerText || "بدون عنوان",
          url: item.querySelector("a")?.href || "#",
          status: item.querySelector(".ad-status")?.innerText?.toLowerCase() || "pending",
          views: parseInt(item.querySelector(".ad-views")?.innerText) || 0,
          lastRenewed: item.querySelector(".ad-date")?.innerText || ""
        });
      });
      return ads;
    });

    const upsertOps = platformAds.map(ad => ({
      updateOne: {
        filter: { platformAdId: ad.platformAdId, userId },
        update: {
          $set: {
            title: ad.title,
            url: ad.url,
            status: mapStatus(ad.status),
            views: ad.views,
            lastRenewed: parseArabicDate(ad.lastRenewed),
            platform
          }
        },
        upsert: true
      }
    }));

    await Ad.bulkWrite(upsertOps);
    await browser.close();

    const userAds = await Ad.find({ userId }).sort({ lastRenewed: -1 });

    res.status(200).json({
      success: true,
      message: `Synced ${platformAds.length} ads from ${platform}`,
      ads: userAds
    });
  } catch (error) {
    next(error);
  }
};

// Reply to messages (example for a platform)
export const replyMessages = async (req, res, next) => {
  try {
    const { platform, replies } = req.body; // replies: [{adId, message}]
    const userId = req.user.id;
    if (!platform || !replies) return next(errorHandler(400, "Platform or replies missing"));

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    if (req.user.platformCredentials?.[platform]?.cookies) {
      await page.setCookie(...req.user.platformCredentials[platform].cookies);
    }

    for (const r of replies) {
      const ad = await Ad.findOne({ _id: r.adId, userId });
      if (!ad) continue;
      await page.goto(`${ad.url}/messages`);
      await page.type("textarea.message-input", r.message);
      await page.click("button.send-message");
      await page.waitForTimeout(1000);
    }

    await browser.close();
    res.status(200).json({ success: true, message: "Messages sent" });
  } catch (error) {
    next(error);
  }
};
