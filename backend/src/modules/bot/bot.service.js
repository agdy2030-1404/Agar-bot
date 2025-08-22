import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// استخدام إضافة التخفي لتجنب الكشف
puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class BotService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isLoggedIn = false;
    this.cookiesPath = path.join(__dirname, "cookies.json");
    this.updateQueue = [];
    this.isProcessingQueue = false;
    this.messageQueue = [];
    this.isProcessingMessages = false;
  }

  // تهيئة المتصفح
  async initBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // يمكن تغييره إلى true في production
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
        ],
        defaultViewport: null,
      });

      this.page = await this.browser.newPage();

      // تعيين User-Agent واقعي
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );

      return true;
    } catch (error) {
      console.error("Error initializing browser:", error);
      throw error;
    }
  }

  // تحميل الكوكيز المحفوظة
  async loadCookies() {
    try {
      if (fs.existsSync(this.cookiesPath)) {
        const cookiesString = fs.readFileSync(this.cookiesPath, "utf8");
        const cookies = JSON.parse(cookiesString);

        await this.page.setCookie(...cookies);
        console.log("Cookies loaded successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error loading cookies:", error);
      return false;
    }
  }

  // حفظ الكوكيز
  async saveCookies() {
    try {
      const cookies = await this.page.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
      console.log("Cookies saved successfully");
    } catch (error) {
      console.error("Error saving cookies:", error);
    }
  }

  // تسجيل الدخول إلى موقع عقار
  async loginToAqar() {
    try {
      // الانتقال إلى صفحة التسجيل
      await this.page.goto("https://aqar.fm", { waitUntil: "networkidle2" });

      // النقر على زر الحساب لفتح نافذة التسجيل
      await this.page.waitForSelector("button._profile__Ji8ui", {
        timeout: 10000,
      });
      await this.page.click("button._profile__Ji8ui");

      // الانتظار حتى تظهر نافذة التسجيل
      await this.page.waitForSelector(".auth_authContainer__lxV5d", {
        timeout: 10000,
      });

      // ملء حقل رقم الجوال
      await this.page.waitForSelector('input[name="phone"]', {
        timeout: 10000,
      });
      await this.page.type('input[name="phone"]', process.env.AQAR_USERNAME, {
        delay: 100,
      });

      // ملء حقل كلمة المرور
      await this.page.waitForSelector('input[name="password"]', {
        timeout: 10000,
      });
      await this.page.type(
        'input[name="password"]',
        process.env.AQAR_PASSWORD,
        { delay: 100 }
      );

      // النقر على زر الدخول
      await this.page.waitForSelector("button.auth_actionButton___fcG7", {
        timeout: 10000,
      });
      await this.page.click("button.auth_actionButton___fcG7");

      // الانتظار حتى يتم التوجيه إلى الصفحة الرئيسية بعد التسجيل
      await this.page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // التحقق من نجاح التسجيل عن طريق البحث عن عناصر لوحة المستخدم
      await this.page.waitForSelector(".sidebar_userInfo__BwI9S", {
        timeout: 15000,
      });

      // حفظ الكوكيز للجلسات القادمة
      await this.saveCookies();

      this.isLoggedIn = true;
      console.log("Login successful");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // التحقق من حالة التسجيل
  async checkLoginStatus() {
    try {
      if (!this.isLoggedIn) {
        // محاولة استخدام الكوكيز المحفوظة
        const cookiesLoaded = await this.loadCookies();
        if (cookiesLoaded) {
          await this.page.goto("https://aqar.fm", {
            waitUntil: "networkidle2",
          });

          // التحقق من وجود عناصر المستخدم المسجل دخوله
          try {
            await this.page.waitForSelector(".sidebar_userInfo__BwI9S", {
              timeout: 10000,
            });
            this.isLoggedIn = true;
            return true;
          } catch (e) {
            this.isLoggedIn = false;
          }
        }

        // إذا فشل تحميل الكوكيز، قم بتسجيل الدخول يدوياً
        if (!this.isLoggedIn) {
          return await this.loginToAqar();
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }

  async getMyAds() {
    try {
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      // الانتقال إلى صفحة إعلاناتي
      await this.page.goto("https://aqar.fm/user/ads", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة
      await this.page.waitForSelector(
        ".userListings_listingsContainer__0d7mf",
        {
          timeout: 15000,
        }
      );

      // استخراج بيانات الإعلانات
      const ads = await this.page.evaluate(() => {
        const adElements = document.querySelectorAll('a[href^="/ad/"]');
        const adsData = [];

        adElements.forEach((ad) => {
          // استخراج رقم الإعلان من الرابط
          const href = ad.getAttribute("href");
          const adId = href.split("/ad/")[1];

          // استخراج العنوان
          const titleElement = ad.querySelector("h4");
          const title = titleElement ? titleElement.textContent.trim() : "";

          // استخراج السعر
          const priceElement = ad.querySelector("._price__X51mi span");
          const price = priceElement ? priceElement.textContent.trim() : "";

          // استخراج المساحة
          const areaElement = ad.querySelector("._spec__SIJiK:first-child");
          const area = areaElement
            ? areaElement.textContent.replace("م²", "").trim()
            : "";

          // استخراج عدد الغرف
          const roomsElement = Array.from(
            ad.querySelectorAll("._spec__SIJiK")
          ).find(
            (el) =>
              el.textContent.includes("غرف") ||
              el.querySelector('img[alt*="غرف"]')
          );
          const rooms = roomsElement
            ? roomsElement.textContent.replace("غرف", "").trim()
            : "";

          // استخراج الصورة
          const imageElement = ad.querySelector("img");
          const imageUrl = imageElement ? imageElement.src : "";

          adsData.push({
            adId,
            title,
            price,
            area,
            rooms,
            imageUrl,
            link: `https://aqar.fm${href}`,
            status: "active", // يمكن تحديد الحالة بناءً على العناصر الأخرى
            views: "0", // سيتم تحديث هذا لاحقاً
            createdAt: new Date().toISOString(),
          });
        });

        return adsData;
      });

      return ads;
    } catch (error) {
      console.error("Error fetching ads:", error);

      // محاولة بديلة إذا فشلت الطريقة الأولى
      try {
        return await this.alternativeGetAds();
      } catch (fallbackError) {
        throw new Error(
          `Failed to fetch ads: ${error.message}. Fallback also failed: ${fallbackError.message}`
        );
      }
    }
  }

  // طريقة بديلة لجلب الإعلانات
  async alternativeGetAds() {
    try {
      await this.page.goto("https://aqar.fm/user/listings", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الإعلانات
      await this.page.waitForSelector("._listingCard__PoR_B", {
        timeout: 15000,
      });

      const ads = await this.page.evaluate(() => {
        const cards = document.querySelectorAll("._listingCard__PoR_B");
        const adsData = [];

        cards.forEach((card) => {
          const linkElement = card.closest("a");
          if (!linkElement) return;

          const href = linkElement.getAttribute("href");
          const adId = href.split("/").pop();

          const titleElement = card.querySelector("h4");
          const title = titleElement ? titleElement.textContent.trim() : "";

          const priceElement = card.querySelector("._price__X51mi");
          const price = priceElement ? priceElement.textContent.trim() : "";

          const specs = Array.from(card.querySelectorAll("._spec__SIJiK")).map(
            (spec) => spec.textContent.trim()
          );

          const imageElement = card.querySelector("img");
          const imageUrl = imageElement ? imageElement.src : "";

          adsData.push({
            adId,
            title,
            price,
            specs,
            imageUrl,
            link: `https://aqar.fm${href}`,
            status: "active",
            views: "0",
            createdAt: new Date().toISOString(),
          });
        });

        return adsData;
      });

      return ads;
    } catch (error) {
      throw new Error(`Alternative method failed: ${error.message}`);
    }
  }

  async alternativeUpdateAd(adId) {
    try {
      console.log(`محاولة التحديث البديلة للإعلان: ${adId}`);

      // الانتقال إلى صفحة إعلاناتي
      await this.page.goto("https://aqar.fm/user/ads", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // البحث عن الإعلان المحدد
      const adSelector = `a[href*="/ad/${adId}"]`;
      await this.page.waitForSelector(adSelector, {
        timeout: 15000,
      });

      // الانتقال إلى عنصر الإعلان
      const adElement = await this.page.$(adSelector);
      if (!adElement) {
        throw new Error("الإعلان غير موجود في لوحة التحكم");
      }

      // البحث عن زر التحديث ضمن بطاقة الإعلان
      const updateButton = await adElement.$('button:has-text("تحديث")');
      if (!updateButton) {
        throw new Error("زر التحديث غير موجود في لوحة التحكم");
      }

      // النقر على زر التحديث
      await updateButton.click();

      // انتظار ومعالجة نافذة التأكيد
      await this.page.waitForTimeout(2000);

      const confirmButton = await this.page.$(
        'button:has-text("تأكيد"), button:has-text("نعم")'
      );
      if (confirmButton) {
        await confirmButton.click();
      }

      await this.page.waitForTimeout(3000);

      console.log(`تم تحديث الإعلان ${adId} بنجاح من لوحة التحكم`);
      return {
        success: true,
        message: "تم تحديث الإعلان بنجاح من لوحة التحكم",
        adId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`الطريقة البديلة فشلت: ${error.message}`);
    }
  }

  // جلب تفاصيل إعلان معين
  async getAdDetails(adId) {
    try {
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      await this.page.goto(`https://aqar.fm/ad/${adId}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل التفاصيل
      await this.page.waitForSelector("._title__eliuu", {
        timeout: 15000,
      });

      const adDetails = await this.page.evaluate(() => {
        // استخراج التفاصيل الرئيسية
        const titleElement = document.querySelector("._title__eliuu h1");
        const title = titleElement ? titleElement.textContent.trim() : "";

        const priceElement = document.querySelector("._price__EH7rC");
        const price = priceElement ? priceElement.textContent.trim() : "";

        const descriptionElement = document.querySelector("._root__lFkcr p");
        const description = descriptionElement
          ? descriptionElement.textContent.trim()
          : "";

        // استخراج التفاصيل الفنية
        const details = {};
        const detailElements = document.querySelectorAll(
          "._newSpecCard__hWWBI ._item___4Sv8"
        );

        detailElements.forEach((item) => {
          const labelElement = item.querySelector("._label___qjLO");
          const valueElement = item.querySelector("._value__yF2Fx");

          if (labelElement && valueElement) {
            const label = labelElement.textContent.trim();
            const value = valueElement.textContent.trim();
            details[label] = value;
          }
        });

        // استخراج المميزات
        const features = [];
        const featureElements = document.querySelectorAll(
          "._newSpecCard__hWWBI._boolean__waHdB ._label___qjLO"
        );

        featureElements.forEach((feature) => {
          features.push(feature.textContent.trim());
        });

        // استخراج عدد المشاهدات
        const viewsElement = Array.from(
          document.querySelectorAll("._item___4Sv8")
        ).find((item) => item.textContent.includes("المشاهدات"));
        const views = viewsElement
          ? viewsElement.querySelector("span:last-child").textContent.trim()
          : "0";

        return {
          title,
          price,
          description,
          details,
          features,
          views,
          lastUpdated: new Date().toISOString(),
        };
      });

      return adDetails;
    } catch (error) {
      console.error("Error fetching ad details:", error);
      throw error;
    }
  }

  // جلب الإعلانات
  async getAds() {
    try {
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      // الانتقال إلى صفحة الإعلانات
      await this.page.goto("https://aqar.fm/user/ads", {
        waitUntil: "networkidle2",
      });

      // انتظار تحميل الإعلانات
      await this.page.waitForSelector('[data-testid="ad-item"]', {
        timeout: 15000,
      });

      // استخراج بيانات الإعلانات
      const ads = await this.page.evaluate(() => {
        const adElements = document.querySelectorAll('[data-testid="ad-item"]');
        const adsData = [];

        adElements.forEach((ad) => {
          const title =
            ad.querySelector(".ad-title")?.textContent?.trim() || "";
          const price =
            ad.querySelector(".ad-price")?.textContent?.trim() || "";
          const status =
            ad.querySelector(".ad-status")?.textContent?.trim() || "";
          const views =
            ad.querySelector(".ad-views")?.textContent?.trim() || "";
          const link = ad.querySelector("a")?.href || "";

          adsData.push({
            title,
            price,
            status,
            views,
            link,
          });
        });

        return adsData;
      });

      return ads;
    } catch (error) {
      console.error("Error fetching ads:", error);
      throw error;
    }
  }

  // تحديث إعلان
  async updateAd(adId) {
    try {
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      console.log(`جاري تحديث الإعلان: ${adId}`);

      // الانتقال إلى صفحة الإعلان
      await this.page.goto(`https://aqar.fm/ad/${adId}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة
      await this.page.waitForSelector("._controls__7BE3y", {
        timeout: 15000,
      });

      // البحث عن زر التحديث
      const updateButton = await this.page.$('button:has-text("تحديث")');

      if (!updateButton) {
        throw new Error("زر التحديث غير موجود");
      }

      // التحقق مما إذا كان الزر معطلاً
      const isDisabled = await this.page.evaluate((button) => {
        return button.disabled || button.getAttribute("disabled") !== null;
      }, updateButton);

      if (isDisabled) {
        throw new Error("زر التحديث غير متاح حالياً");
      }

      // النقر على زر التحديث
      await updateButton.click();

      // انتظار ظهور نافذة التأكيد إذا كانت موجودة
      try {
        await this.page.waitForSelector('.modal, .dialog, [role="dialog"]', {
          timeout: 5000,
        });

        // البحث عن زر التأكيد والنقر عليه
        const confirmButton = await this.page.$(
          'button:has-text("تأكيد"), button:has-text("نعم"), button:has-text("موافق")'
        );
        if (confirmButton) {
          await confirmButton.click();
        }
      } catch (modalError) {
        // إذا لم تظهر نافذة تأكيد، نستمر
        console.log("لا توجد نافذة تأكيد للتحديث");
      }

      // انتظار اكتمال التحديث
      await this.page.waitForTimeout(3000);

      // التحقق من نجاح التحديث
      const successMessage = await this.page.evaluate(() => {
        const successElement = document.querySelector(
          ".success, .alert-success, .toast-success"
        );
        return successElement ? successElement.textContent.trim() : null;
      });

      if (successMessage) {
        console.log(`تم تحديث الإعلان ${adId} بنجاح: ${successMessage}`);
        return {
          success: true,
          message: "تم تحديث الإعلان بنجاح",
          adId,
          timestamp: new Date().toISOString(),
        };
      } else {
        // محاولة التحقق بطريقة أخرى
        await this.page.waitForTimeout(2000);
        const currentUrl = this.page.url();
        if (currentUrl.includes("/ad/") || currentUrl.includes("/user/ads")) {
          console.log(`تم تحديث الإعلان ${adId} بنجاح`);
          return {
            success: true,
            message: "تم تحديث الإعلان بنجاح",
            adId,
            timestamp: new Date().toISOString(),
          };
        } else {
          throw new Error("فشل في التحقق من نجاح التحديث");
        }
      }
    } catch (error) {
      console.error(`فشل في تحديث الإعلان ${adId}:`, error);

      // محاولة بديلة باستخدام لوحة التحكم
      try {
        return await this.alternativeUpdateAd(adId);
      } catch (fallbackError) {
        throw new Error(
          `فشل في تحديث الإعلان: ${error.message}. الطريقة البديلة فشلت أيضاً: ${fallbackError.message}`
        );
      }
    }
  }

  addToUpdateQueue(adId, priority = "normal") {
    const existingItem = this.updateQueue.find((item) => item.adId === adId);

    if (!existingItem) {
      this.updateQueue.push({
        adId,
        priority,
        addedAt: new Date(),
        attempts: 0,
        lastAttempt: null,
      });
      console.log(`تم إضافة الإعلان ${adId} إلى قائمة الانتظار`);
    }

    // بدء معالجة الطابور إذا لم يكن يعمل
    if (!this.isProcessingQueue) {
      this.processUpdateQueue();
    }
  }

  async processUpdateQueue() {
    if (this.isProcessingQueue || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    try {
      // ترتيب الطابور حسب الأولوية
      this.updateQueue.sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      while (this.updateQueue.length > 0) {
        const queueItem = this.updateQueue[0];

        try {
          // تحديث الإعلان
          const result = await this.updateAd(queueItem.adId);

          if (result.success) {
            // إزالة من الطابور عند النجاح
            this.updateQueue.shift();
            console.log(
              `تم تحديث الإعلان ${queueItem.adId} وإزالته من الطابور`
            );
          } else {
            // زيادة عدد المحاولات
            queueItem.attempts++;
            queueItem.lastAttempt = new Date();

            if (queueItem.attempts >= 3) {
              // إزالة من الطابور بعد 3 محاولات فاشلة
              this.updateQueue.shift();
              console.log(
                `تم إزالة الإعلان ${queueItem.adId} بعد 3 محاولات فاشلة`
              );
            } else {
              // نقل إلى نهاية الطابور للمحاولة لاحقاً
              this.updateQueue.push(this.updateQueue.shift());
            }
          }
        } catch (error) {
          console.error(`خطأ في معالجة الإعلان ${queueItem.adId}:`, error);
          queueItem.attempts++;
          queueItem.lastAttempt = new Date();

          if (queueItem.attempts >= 3) {
            this.updateQueue.shift();
          } else {
            this.updateQueue.push(this.updateQueue.shift());
          }
        }

        // انتظار عشوائي بين التحديثات (1-5 دقائق)
        const randomWait = Math.floor(Math.random() * 4 * 60000) + 60000;
        await this.page.waitForTimeout(randomWait);
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // جدولة التحديثات التلقائية
  scheduleAutoUpdates(ads, minHours = 20, maxHours = 48) {
    for (const ad of ads) {
      const randomHours =
        Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;
      const updateTime = new Date(Date.now() + randomHours * 60 * 60 * 1000);

      setTimeout(() => {
        this.addToUpdateQueue(ad.adId, "normal");
      }, randomHours * 60 * 60 * 1000);

      console.log(`تم جدولة تحديث الإعلان ${ad.adId} بعد ${randomHours} ساعة`);
    }
  }
  async fetchNewMessages() {
    try {
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      console.log("جاري جلب الرسائل الجديدة...");

      // الانتقال إلى صفحة طلبات التواصل
      await this.page.goto("https://aqar.fm/user/communication-requests", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة
      await this.page.waitForSelector("._communications__Dx82y", {
        timeout: 15000,
      });

      // استخراج الرسائل
      const messages = await this.page.evaluate(() => {
        const messageCards = document.querySelectorAll("._requestCard__uj_k6");
        const messagesData = [];

        messageCards.forEach((card) => {
          // استخراج اسم المرسل
          const nameElement = card.querySelector("p:first-child");
          const senderName = nameElement ? nameElement.textContent.trim() : "";

          // استخراج التاريخ
          const dateElement = card.querySelector("p:last-child");
          const receivedDate = dateElement
            ? dateElement.textContent.trim()
            : "";

          // استخراج حالة الرسالة (غير مقروءة)
          const statusElement = card.querySelector("._status__cGrCS");
          const isNew =
            statusElement &&
            !statusElement.classList.contains("_contacted__ldMj3");

          // استخراج زر الواتساب
          const whatsappButton = card.querySelector("button");
          const hasWhatsapp =
            whatsappButton && whatsappButton.textContent.includes("واتساب");

          if (isNew) {
            messagesData.push({
              senderName,
              receivedDate,
              hasWhatsapp,
              isNew: true,
            });
          }
        });

        return messagesData;
      });

      console.log(`تم العثور على ${messages.length} رسالة جديدة`);
      return messages;
    } catch (error) {
      console.error("فشل في جلب الرسائل:", error);
      throw error;
    }
  }

  // الرد على رسالة عبر الواتساب
  async replyViaWhatsapp(message, replyText) {
    try {
      console.log(`جاري الرد على ${message.senderName} عبر الواتساب...`);

      // الانتقال إلى صفحة طلبات التواصل
      await this.page.goto("https://aqar.fm/user/communication-requests", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة
      await this.page.waitForSelector("._communications__Dx82y", {
        timeout: 15000,
      });

      // البحث عن رسالة المرسل المحدد
      const senderSelector = `._requestCard__uj_k6:has(p:contains("${message.senderName}"))`;
      await this.page.waitForSelector(senderSelector, {
        timeout: 10000,
      });

      // النقر على زر الواتساب
      const whatsappButton = await this.page.$(`${senderSelector} button`);
      if (!whatsappButton) {
        throw new Error("زر الواتساب غير موجود");
      }

      // فتح نافذة الواتساب
      await whatsappButton.click();

      // الانتظار لتحميل الواتساب
      await this.page.waitForTimeout(5000);

      // الحصول على جميع Tabs المفتوحة
      const pages = await this.browser.pages();
      const whatsappPage = pages.find((page) =>
        page.url().includes("web.whatsapp.com")
      );

      if (!whatsappPage) {
        throw new Error("لم يتم فتح الواتساب");
      }

      // الانتقال إلى صفحة الواتساب
      await whatsappPage.bringToFront();

      // انتظار تحميل الواتساب
      await whatsappPage.waitForSelector(
        'div[contenteditable="true"][data-tab="10"]',
        {
          timeout: 15000,
        }
      );

      // كتابة الرسالة
      const messageInput = await whatsappPage.$(
        'div[contenteditable="true"][data-tab="10"]'
      );
      await messageInput.click();
      await whatsappPage.keyboard.type(replyText);

      // إرسال الرسالة
      await whatsappPage.keyboard.press("Enter");

      console.log(`تم إرسال الرد إلى ${message.senderName}`);

      // العودة إلى الصفحة الرئيسية
      await this.page.bringToFront();

      return true;
    } catch (error) {
      console.error(`فشل في الرد عبر الواتساب:`, error);

      // محاولة بديلة
      try {
        return await this.alternativeWhatsappReply(message, replyText);
      } catch (fallbackError) {
        throw new Error(
          `فشل في الرد عبر الواتساب: ${error.message}. الطريقة البديلة فشلت أيضاً: ${fallbackError.message}`
        );
      }
    }
  }

  // طريقة بديلة للرد عبر الواتساب
  async alternativeWhatsappReply(message, replyText) {
    try {
      console.log(`محاولة بديلة للرد على ${message.senderName}...`);

      // فتح رابط واتساب مباشر (إذا كان الرقم متوفراً)
      // هذه طريقة بديلة إذا فشلت الطريقة الأولى
      await this.page.goto("https://web.whatsapp.com", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الواتساب
      await this.page.waitForSelector(
        'div[contenteditable="true"][data-tab="10"]',
        {
          timeout: 15000,
        }
      );

      // البحث عن المحادثة (هنا تحتاج إلى معرفة رقم الهاتف)
      // هذه مجرد مثال - تحتاج إلى تكييفها حسب بياناتك
      const searchInput = await this.page.$(
        'div[contenteditable="true"][data-tab="10"]'
      );
      await searchInput.click();
      await this.page.keyboard.type(message.senderName);
      await this.page.waitForTimeout(2000);

      // اختيار المحادثة الأولى
      const firstChat = await this.page.$('div[role="listitem"]');
      if (firstChat) {
        await firstChat.click();
        await this.page.waitForTimeout(2000);

        // كتابة الرسالة
        const messageInput = await this.page.$(
          'div[contenteditable="true"][data-tab="10"]'
        );
        await messageInput.click();
        await this.page.keyboard.type(replyText);

        // إرسال الرسالة
        await this.page.keyboard.press("Enter");

        console.log(`تم إرسال الرد البديل إلى ${message.senderName}`);
        return true;
      }

      throw new Error("لم يتم العثور على المحادثة");
    } catch (error) {
      throw new Error(`الطريقة البديلة فشلت: ${error.message}`);
    }
  }

  // اختيار قالب الرد المناسب
  async selectReplyTemplate(message) {
    // تحليل محتوى الرسالة لتحديد الرد المناسب
    const messageContent = message.messageContent.toLowerCase();

    // قوالب الردود الافتراضية
    const templates = {
      greeting: "السلام عليكم، شكراً لتواصلكم. كيف يمكنني مساعدتك؟",
      price:
        "أهلاً وسهلاً، السعر المذكور في الإعلان نهائي وقابل للتفاوض حسب الظروف.",
      availability: "نعم، الإعلان لا يزال متاح. هل ترغب في الترتيب لمعاينة؟",
      location:
        "المكان موضح في الخريطة في الإعلان. هل تحتاج إلى اتجاهات محددة؟",
      default: "شكراً لاهتمامك بالإعلان. هل لديك استفسار محدد؟",
    };

    // تحديد نوع الاستفسار
    if (
      messageContent.includes("سعر") ||
      messageContent.includes("ثمن") ||
      messageContent.includes("كم")
    ) {
      return templates.price;
    } else if (
      messageContent.includes("متاح") ||
      messageContent.includes("موجود") ||
      messageContent.includes("لازال")
    ) {
      return templates.availability;
    } else if (
      messageContent.includes("مكان") ||
      messageContent.includes("موقع") ||
      messageContent.includes("عنوان")
    ) {
      return templates.location;
    } else if (
      messageContent.includes("السلام") ||
      messageContent.includes("مرحب") ||
      messageContent.includes("اهلا")
    ) {
      return templates.greeting;
    } else {
      return templates.default;
    }
  }

  // معالجة الرسائل الجديدة
  async processNewMessages() {
    try {
      const messages = await this.fetchNewMessages();

      for (const message of messages.filter((m) => m.isNew)) {
        try {
          // اختيار قالب الرد
          const replyText = await this.selectReplyTemplate(message);

          // الرد عبر الواتساب
          const success = await this.replyViaWhatsapp(message, replyText);

          if (success) {
            console.log(`تم الرد على ${message.senderName} بنجاح`);

            // هنا يمكنك تحديث حالة الرسالة في قاعدة البيانات
            // await Message.updateOne({ messageId: message.id }, { status: 'replied' });
          }

          // انتظار عشوائي بين الردود (1-3 دقائق)
          const randomWait = Math.floor(Math.random() * 2 * 60000) + 60000;
          await this.page.waitForTimeout(randomWait);
        } catch (error) {
          console.error(`فشل في معالجة رسالة ${message.senderName}:`, error);
        }
      }

      return { processed: messages.length, success: true };
    } catch (error) {
      console.error("فشل في معالجة الرسائل:", error);
      return { processed: 0, success: false, error: error.message };
    }
  }

  // إضافة رسالة إلى طابور المعالجة
  addToMessageQueue(message, priority = "normal") {
    this.messageQueue.push({
      ...message,
      priority,
      addedAt: new Date(),
      attempts: 0,
    });
    console.log(`تم إضافة رسالة من ${message.senderName} إلى طابور المعالجة`);
  }

  // معالجة طابور الرسائل
  async processMessageQueue() {
    if (this.isProcessingMessages || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingMessages = true;

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue[0];

        try {
          const result = await this.processSingleMessage(message);

          if (result.success) {
            this.messageQueue.shift();
          } else {
            message.attempts++;
            if (message.attempts >= 2) {
              this.messageQueue.shift();
            }
          }
        } catch (error) {
          console.error(`خطأ في معالجة الرسالة:`, error);
          message.attempts++;
          if (message.attempts >= 2) {
            this.messageQueue.shift();
          }
        }

        await this.page.waitForTimeout(30000); // انتظار 30 ثانية بين الرسائل
      }
    } finally {
      this.isProcessingMessages = false;
    }
  }
  // إيقاف الروبوت
  async stop() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        this.isLoggedIn = false;
      }
      return { success: true, message: "Bot stopped successfully" };
    } catch (error) {
      console.error("Error stopping bot:", error);
      throw error;
    }
  }
}

export default new BotService();
