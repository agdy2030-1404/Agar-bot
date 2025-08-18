// controllers/bot.controller.js
import { Bot } from "./bot.model.js";
import { errorHandler } from "../../utils/error.js";
import cron from "node-cron";
import puppeteer from "puppeteer";

// ------------------ Bot Initialization ------------------ //
export const initializeBot = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let bot = await Bot.findOne({ userId });
    if (!bot) {
      bot = new Bot({ userId });
      await bot.save();
    }
    res.status(200).json({ success: true, bot });
  } catch (error) {
    next(error);
  }
};

// ------------------ Update Bot Settings ------------------ //
export const updateBotSettings = async (req, res, next) => {
  try {
    const { isRunning, updateInterval, autoReplyEnabled } = req.body;
    const userId = req.user.id;

    const updateFields = {
      isRunning,
      updateInterval,
      nextRun: calculateNextRun(updateInterval),
    };
    if (typeof autoReplyEnabled !== "undefined") {
      updateFields["settings.autoReplyEnabled"] = autoReplyEnabled;
    }

    const bot = await Bot.findOneAndUpdate({ userId }, updateFields, {
      new: true,
    });
    if (!bot) return next(errorHandler(404, "Bot not found"));

    if (bot.isRunning) {
      scheduleBotTasks(bot);
      runBotTasks(bot).catch((err) =>
        console.error("Immediate bot run failed:", err)
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Bot settings updated", bot });
  } catch (error) {
    next(error);
  }
};

// ------------------ Add Reply Template ------------------ //
export const addReplyTemplate = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const bot = await Bot.findOneAndUpdate(
      { userId },
      { $push: { "settings.replyTemplates": { title, content } } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Template added",
      templates: bot.settings.replyTemplates,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------ Get Bot Status ------------------ //
export const getBotStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bot = await Bot.findOne({ userId });
    if (!bot) return next(errorHandler(404, "Bot not found"));
    res.status(200).json({ success: true, bot });
  } catch (error) {
    next(error);
  }
};

// ------------------ Bot Execution ------------------ //
async function runBotTasks(bot) {
  const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
  try {
    // -------- Haraj -------- //
    if (process.env.ENABLE_HARAJ === "true") {
      try {
        const harajPage = await loginToHaraj(bot, browser);
        await updateHarajAds(harajPage, bot);
        if (bot.settings.autoReplyEnabled)
          await replyHarajMessages(harajPage, bot);
      } catch (err) {
        console.error("Haraj error:", err.message);
      }
    }
    // -------- Aqar.fm -------- //
    if (process.env.ENABLE_AQAR === "true") {
      try {
        const aqarPage = await loginToAqar(bot, browser);
        await updateAqarAds(aqarPage, bot);
        if (bot.settings.autoReplyEnabled)
          await replyAqarMessages(aqarPage, bot);
      } catch (err) {
        console.error("Aqar error:", err.message);
      }
    }
    // Update last run
    await Bot.findByIdAndUpdate(bot._id, {
      lastRun: new Date(),
      nextRun: calculateNextRun(bot.updateInterval),
    });
  } finally {
    await browser.close();
  }
}

// ------------------ Haraj Functions ------------------ //
async function loginToHaraj(bot, browser) {
  const page = await browser.newPage();
  await page.goto("https://haraj.com.sa/");

  await page.waitForSelector("button[data-testid='login-link']", {
    visible: true,
  });
  await page.click("button[data-testid='login-link']");

  await page.waitForSelector("input[data-testid='auth_username']", {
    visible: true,
  });
  await page.type(
    "input[data-testid='auth_username']",
    process.env.HARAJ_USERNAME
  );
  await page.click("button[data-testid='auth_submit_username']");

  await page.waitForSelector("input[data-testid='auth_password']", {
    visible: true,
  });
  await page.type(
    "input[data-testid='auth_password']",
    process.env.HARAJ_PASSWORD
  );
  await page.click("button[data-testid='auth_submit_login']");

  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Haraj login success ✅");

  const cookies = await page.cookies();
  await Bot.findByIdAndUpdate(bot._id, {
    "platformCredentials.harajCookies": cookies,
    "platformCredentials.harajLastLogin": new Date(),
  });

  return page;
}

async function updateHarajAds(page, bot) {
  await page.goto("https://haraj.com.sa/my-ads");
  const ads = await page.$$eval(".ad-item", (items) =>
    items.map((item) => ({
      id: item.dataset.adId,
      title: item.querySelector(".ad-title")?.innerText,
      url: item.querySelector("a")?.href,
    }))
  );
  for (const ad of ads) {
    await page.goto(ad.url);
    const updateButton = await page.$(".update-ad");
    if (updateButton) {
      await updateButton.click();
      await page.waitForTimeout(2000);
      await Bot.findByIdAndUpdate(bot._id, {
        $inc: { "stats.adsUpdated": 1 },
        $set: { "stats.lastAdUpdate": new Date() },
      });
    }
  }
}

async function replyHarajMessages(page, bot) {
  await page.goto("https://haraj.com.sa/messages");
  const messages = await page.$$eval(".message-item", (items) =>
    items
      .filter((item) => item.querySelector(".unread"))
      .map((item) => ({
        id: item.dataset.messageId,
        content: item.querySelector(".message-content")?.innerText,
      }))
  );
  for (const msg of messages) {
    await page.goto(`https://haraj.com.sa/messages/${msg.id}`);
    const template =
      bot.settings.replyTemplates[
        Math.floor(Math.random() * bot.settings.replyTemplates.length)
      ];
    await page.type("#reply-input", template.content);
    await page.click("#send-reply");
    await page.waitForTimeout(1000);
    await Bot.findByIdAndUpdate(bot._id, {
      $inc: { "stats.messagesReplied": 1 },
      $set: { "stats.lastMessageReply": new Date() },
    });
  }
}

// ------------------ Aqar.fm Functions ------------------ //
async function loginToAqar(bot, browser) {
  const page = await browser.newPage();
  await page.goto("https://sa.aqar.fm/");

  await page.waitForSelector("button._profile__Ji8ui", { visible: true });
  await page.click("button._profile__Ji8ui");

  await page.waitForSelector("input[name='phone']", { visible: true });
  await page.type("input[name='phone']", process.env.AQAR_USERNAME);

  await page.type("input[name='password']", process.env.AQAR_PASSWORD);

  await page.click("button.auth_actionButton___fcG7");
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  console.log("Aqar login success ✅");

  const cookies = await page.cookies();
  await Bot.findByIdAndUpdate(bot._id, {
    "platformCredentials.aqarCookies": cookies,
    "platformCredentials.aqarLastLogin": new Date(),
  });

  return page;
}

async function updateAqarAds(page, bot) {
  // هنا ضع الكود المناسب لتحديث الإعلانات على Aqar حسب هيكل الموقع
  console.log("Updating Aqar ads... (قم بإضافة المنطق الخاص بك)");
}

async function replyAqarMessages(page, bot) {
  // هنا ضع الكود المناسب للرد على الرسائل على Aqar حسب هيكل الموقع
  console.log("Replying to Aqar messages... (قم بإضافة المنطق الخاص بك)");
}

// ------------------ Scheduler & Helpers ------------------ //
function calculateNextRun(interval) {
  const baseHours = interval;
  const randomVariation = Math.floor(Math.random() * 8) - 4;
  const nextRun = new Date();
  nextRun.setHours(nextRun.getHours() + baseHours + randomVariation);
  return nextRun;
}

function scheduleBotTasks(bot) {
  cron.getTasks().forEach((task) => {
    if (task.options?.name === `bot-${bot.userId}`) task.stop();
  });

  cron.schedule(
    `0 */${bot.updateInterval} * * *`,
    () => {
      if (bot.isRunning) runBotTasks(bot);
    },
    { name: `bot-${bot.userId}`, scheduled: bot.isRunning }
  );
}
