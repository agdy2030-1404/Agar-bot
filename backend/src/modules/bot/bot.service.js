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
  // دالة مساعدة لانتظار وقت محدد
  async wait(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
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
        let cookies = JSON.parse(cookiesString);

        console.log(`Loading ${cookies.length} cookies from file`);

        // تصحيح النطاق للكوكيز
        cookies = cookies.map((cookie) => {
          // جعل جميع كوكيز aqar.fm صالحة للنطاقات الفرعية
          if (cookie.domain && cookie.domain.includes("aqar.fm")) {
            return {
              ...cookie,
              domain: "sa.aqar.fm", // النقطة في البداية تجعلها صالحة لجميع النطاقات الفرعية
            };
          }
          return cookie;
        });

        await this.page.setCookie(...cookies);
        console.log("Cookies loaded successfully with domain fix");

        // التحقق من الكوكيز المحملة
        const loadedCookies = await this.page.cookies();
        console.log(`Total cookies in browser: ${loadedCookies.length}`);

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
      console.log(`Saving ${cookies.length} cookies`);

      // تصحيح النطاق وتواريخ الانتهاء
      const cookiesToSave = cookies.map((cookie) => {
        let updatedCookie = { ...cookie };

        if (cookie.domain && cookie.domain.includes("aqar.fm")) {
          updatedCookie.domain = "sa.aqar.fm";
        }

        // إصلاح تاريخ انتهاء session cookies
        if (cookie.session && cookie.expires <= 0) {
          updatedCookie.expires =
            Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 يوم
          updatedCookie.session = false;
        }

        return updatedCookie;
      });

      fs.writeFileSync(
        this.cookiesPath,
        JSON.stringify(cookiesToSave, null, 2)
      );
      console.log("Cookies saved successfully");
    } catch (error) {
      console.error("Error saving cookies:", error);
    }
  }

  // تسجيل الدخول إلى موقع عقار
  async loginToAqar() {
    try {
      if (!this.browser || !this.page) {
        await this.initBrowser();
      }
      // الانتقال إلى صفحة التسجيل
      await this.page.goto("https://sa.aqar.fm", { waitUntil: "networkidle2" });

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

      // بعد الانتظار للتوجيه إلى الصفحة الرئيسية
      await this.page.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // الانتظار قليلاً ثم محاولة فتح السايدبار للتحقق
      await this.wait(3000);

      try {
        // النقر على أيقونة الحساب لفتح السايدبار
        await this.page.waitForSelector("button._profile__Ji8ui", {
          timeout: 10000,
        });
        await this.page.click("button._profile__Ji8ui");

        // الانتظار حتى يظهر السايدبار والتحقق من عناصر المستخدم
        await this.page.waitForSelector(".sidebar_userInfo__BwI9S", {
          timeout: 15000,
        });
      } catch (error) {
        console.warn(
          "Could not open sidebar, but login might still be successful"
        );
        // محاولة بديلة للتحقق
        const userLinkVisible = await this.page.evaluate(() => {
          return !!document.querySelector('[href*="/user/"]');
        });

        if (!userLinkVisible) {
          throw new Error("Login verification failed - no user elements found");
        }
      }

      // حفظ الكوكيز للجلسات القادمة
      await this.saveCookies();
      // التحقق من الكوكيز
      const cookiesValid = await this.verifyCookies();
      if (!cookiesValid) {
        console.warn("Cookies verification failed after login");
      }

      this.isLoggedIn = true;
      console.log("Login successful and cookies verified");
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async verifyLoginByOpeningSidebar() {
    try {
      // محاولة فتح السايدبار
      await this.page.waitForSelector("button._profile__Ji8ui", {
        timeout: 5000,
      });
      await this.page.click("button._profile__Ji8ui");

      // الانتظار حتى يظهر السايدبار
      await this.page.waitForSelector(".sidebar_container___aoT3", {
        timeout: 5000,
      });

      // التحقق من وجود معلومات المستخدم
      const hasUserInfo = await this.page.evaluate(() => {
        return !!document.querySelector(".sidebar_userInfo__BwI9S");
      });

      // إغلاق السايدبار بالنقر خارجها (اختياري)
      try {
        await this.page.click(".sidebar_overlay__t4lF8", { timeout: 2000 });
      } catch (e) {
        // تجاهل الخطأ إذا لم يتمكن من الإغلاق
      }

      return hasUserInfo;
    } catch (error) {
      console.log("Could not verify login by opening sidebar:", error);
      return false;
    }
  }

  // التحقق من حالة التسجيل
  async checkLoginStatus() {
    try {
      if (!this.page) throw new Error("البوت غير مشغل بعد");

      // إذا كان مسجلاً الدخول مسبقاً
      if (this.isLoggedIn) return true;

      // التحقق من الكوكيز أولاً
      const cookiesLoaded = await this.loadCookies();

      if (cookiesLoaded) {
        // الذهاب إلى الصفحة الرئيسية
        await this.page.goto("https://sa.aqar.fm", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // الانتظار لمدة قصيرة للتحميل
        await this.wait(3000);

        // محاولة فتح السايدبار بالنقر على أيقونة الحساب
        try {
          await this.page.waitForSelector("button._profile__Ji8ui", {
            timeout: 5000,
          });
          await this.page.click("button._profile__Ji8ui");

          // الانتظار حتى يظهر السايدبار
          await this.page.waitForSelector(".sidebar_container___aoT3", {
            timeout: 5000,
          });

          // التحقق من وجود عناصر المستخدم المسجل
          const isLoggedIn = await this.page.evaluate(() => {
            return !!document.querySelector(".sidebar_userInfo__BwI9S");
          });

          if (isLoggedIn) {
            this.isLoggedIn = true;
            console.log("User is logged in (verified by sidebar elements)");
            return true;
          }
        } catch (e) {
          console.log("Sidebar verification failed, trying alternative check");
        }

        // محاولة بديلة للتحقق من التسجيل
        const alternativeCheck = await this.page.evaluate(() => {
          // التحقق من وجود رابط يحتوي على /user/ والذي يشير إلى صفحة المستخدم
          return !!document.querySelector('[href*="/user/"]');
        });

        if (alternativeCheck) {
          this.isLoggedIn = true;
          console.log("User is logged in (verified by user link)");
          return true;
        }
      }

      // إذا فشل التحقق، حاول التسجيل
      if (!this.isLoggedIn) {
        console.log("Not logged in, attempting to login...");
        return await this.loginToAqar();
      }

      return true;
    } catch (error) {
      console.error("Error checking login status:", error);
      return false;
    }
  }
  async verifyCookies() {
    try {
      const cookies = await this.page.cookies();

      // الكوكيز الأساسية المطلوبة
      const requiredCookies = ["user", "cf_clearance", "webapp_token"];
      const hasRequiredCookies = requiredCookies.every((reqCookie) =>
        cookies.some(
          (cookie) =>
            cookie.name === reqCookie && cookie.domain.includes("aqar.fm")
        )
      );

      console.log("Cookies verification:", {
        totalCookies: cookies.length,
        hasUserCookie: cookies.some((c) => c.name === "user"),
        hasCfClearance: cookies.some((c) => c.name === "cf_clearance"),
        hasWebappToken: cookies.some((c) => c.name === "webapp_token"),
        hasRequiredCookies,
      });

      return hasRequiredCookies;
    } catch (error) {
      console.error("Error verifying cookies:", error);
      return false;
    }
  }

  async debugCookies() {
    const cookies = await this.page.cookies();
    console.log("=== CURRENT COOKIES ===");

    cookies.forEach((cookie) => {
      if (cookie.domain.includes("aqar.fm")) {
        console.log({
          name: cookie.name,
          domain: cookie.domain,
          value: cookie.value.substring(0, 50) + "...",
          expires: new Date(cookie.expires * 1000).toLocaleString(),
          session: cookie.session,
        });
      }
    });

    console.log("======================");
  }

  async navigateToUserAds() {
    try {
      console.log("Navigating to user ads page...");

      // استخدام الرابط الصحيح: user/{id} بدلاً من user/ads
      await this.page.goto("https://sa.aqar.fm/user/4151645", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة - نستخدم عناصر أكثر عمومية
      await this.page.waitForSelector(
        '[class*="listing"], [class*="card"], a[href^="/ad/"]',
        {
          timeout: 15000,
        }
      );

      console.log("Successfully navigated to user ads page");
      return true;
    } catch (error) {
      console.error("Error navigating to user ads:", error);

      // محاولة بديلة: الذهاب إلى الصفحة الرئيسية ثم النقر على البروفايل
      try {
        await this.page.goto("https://sa.aqar.fm", {
          waitUntil: "networkidle2",
          timeout: 30000,
        });

        // النقر على زر الحساب
        await this.page.click("button._profile__Ji8ui");
        await this.wait(2000);

        // النقر على رابط البروفايل في السايدبار
        await this.page.click('a[href^="/user/"]');
        await this.page.waitForSelector('[class*="listing"]', {
          timeout: 15000,
        });

        console.log("Navigated to user page via profile click");
        return true;
      } catch (fallbackError) {
        throw new Error(
          `Failed to navigate to user page: ${error.message}. Fallback also failed: ${fallbackError.message}`
        );
      }
    }
  }

  async extractAdsData() {
    try {
      console.log("Extracting ads data...");

      const ads = await this.page.evaluate(() => {
        // البحث عن جميع روابط الإعلانات بطرق مختلفة
        const adSelectors = [
          'a[href^="/ad/"]',
          'a[href*="/ad/"]',
          '[class*="listing"] a',
          '[class*="card"] a',
        ];

        let adElements = [];

        for (const selector of adSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            adElements = Array.from(elements);
            break;
          }
        }

        const adsData = [];

        adElements.forEach((ad) => {
          try {
            const href = ad.getAttribute("href");
            if (!href || !href.includes("/ad/")) return;

            // استخراج رقم الإعلان من الرابط
            const adIdMatch = href.match(/\/ad\/(\d+)/);
            if (!adIdMatch) return;

            const adId = adIdMatch[1];

            // استخراج البيانات بطرق أكثر مرونة
            const titleElement = ad.querySelector(
              "h4, h3, [class*='title'], [class*='name']"
            );
            const priceElement = ad.querySelector(
              "[class*='price'], [class*='cost'], ._price__X51mi"
            );

            // استخراج المواصفات
            const specsContainer = ad.querySelector(
              "[class*='spec'], [class*='detail'], [class*='info']"
            );
            let area = "",
              rooms = "";

            if (specsContainer) {
              const specElements = specsContainer.querySelectorAll(
                "[class*='spec'], [class*='item']"
              );
              specElements.forEach((spec) => {
                const text = spec.textContent || "";
                if (text.includes("م²") || text.includes("المساحة")) {
                  area = text.replace(/[^\d]/g, "");
                }
                if (text.includes("غرف") || text.includes("غرفة")) {
                  rooms = text.replace(/[^\d]/g, "");
                }
              });
            }

            // استخراج الصورة
            const imageElement = ad.querySelector("._imageWrapper__ZiYzs img");

            let imageUrl = "";
            if (imageElement) {
              // نعطي الأولوية لـ src لأنه يحمل رابط مباشر
              imageUrl = imageElement.getAttribute("src");

              // إذا src فاضي أو غير موجود، نستخرج أول رابط من srcset
              if (!imageUrl && imageElement.srcset) {
                imageUrl = imageElement.srcset.split(" ")[0];
              }
            }
            // استخراج الحالة
            let status = "active";
            const statusElement = ad.querySelector(
              "[class*='publish'], [class*='status'], [class*='state']"
            );
            if (statusElement) {
              const statusText = statusElement.textContent || "";
              if (
                statusText.includes("غير منشور") ||
                statusText.includes("معلق")
              ) {
                status = "inactive";
              }
            }

            adsData.push({
              adId,
              title: titleElement
                ? titleElement.textContent.trim()
                : "لا يوجد عنوان",
              price: priceElement ? priceElement.textContent.trim() : "",
              area,
              rooms,
              imageUrl,
              link: `https://sa.aqar.fm${href}`,
              status,
            });
          } catch (error) {
            console.error("Error extracting ad data:", error);
          }
        });

        return adsData;
      });

      console.log(`Extracted ${ads.length} ads`);
      return ads;
    } catch (error) {
      console.error("Error extracting ads data:", error);
      throw error;
    }
  }

  async getMyAds() {
    try {
      // التحقق من تسجيل الدخول أولاً
      const isLoggedIn = await this.checkLoginStatus();
      if (!isLoggedIn) {
        throw new Error("Not logged in");
      }

      // الانتقال إلى صفحة الإعلانات
      await this.navigateToUserAds();

      // استخراج بيانات الإعلانات
      const ads = await this.extractAdsData();

      // حفظ screenshot للتحقق

      return ads;
    } catch (error) {
      console.error("Error getting ads:", error);

      // محاولة بديلة
      try {
        return await this.alternativeGetAds();
      } catch (fallbackError) {
        throw new Error(
          `Failed to get ads: ${error.message}. Fallback also failed: ${fallbackError.message}`
        );
      }
    }
  }

  // طريقة بديلة لجلب الإعلانات
  async alternativeGetAds() {
    try {
      console.log("Trying alternative method to get ads...");

      await this.page.goto("https://sa.aqar.fm/user/4151645", {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

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
            link: `https://sa.aqar.fm${href}`,
            status: "active",
          });
        });

        return adsData;
      });

      return ads;
    } catch (error) {
      throw new Error(`Alternative method failed: ${error.message}`);
    }
  }

  async navigateToAdPage(adId) {
    try {
      console.log(`Navigating to ad page: ${adId}`);

      await this.page.goto(`https://sa.aqar.fm/ad/${adId}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // انتظار تحميل الصفحة
      await this.page.waitForSelector("._controls__7BE3y, button", {
        timeout: 15000,
      });

      console.log("Successfully navigated to ad page");
      return true;
    } catch (error) {
      console.error("Error navigating to ad page:", error);
      throw error;
    }
  }

  async findUpdateButton() {
    try {
      console.log("Looking for update button...");

      // البحث عن زر التحديث باستخدام طرق متعددة
      let updateButton = null;

      // الطريقة 1: البحث بالنص
      try {
        const buttons = await this.page.$$("button");
        for (const button of buttons) {
          const text = await this.page.evaluate((el) => el.textContent, button);
          if (text && (text.includes("تحديث") || text.includes("تجديد"))) {
            updateButton = button;
            break;
          }
        }
      } catch (e) {
        console.log("Text-based search failed, trying other methods");
      }

      // الطريقة 2: البحث بالكلاس
      if (!updateButton) {
        try {
          const selectors = [
            'button[class*="update"]',
            'button[class*="refresh"]',
            "._updateBtn__",
            "button._control__",
          ];

          for (const selector of selectors) {
            try {
              updateButton = await this.page.$(selector);
              if (updateButton) break;
            } catch (e) {
              // تجاهل الخطأ والمحاولة بالselector التالي
            }
          }
        } catch (e) {
          console.log("Class-based search failed");
        }
      }

      if (!updateButton) {
        throw new Error("زر التحديث غير موجود في الصفحة");
      }

      console.log("Update button found");
      return updateButton;
    } catch (error) {
      console.error("Error finding update button:", error);
      throw error;
    }
  }

  async checkUpdateAvailability(updateButton) {
    try {
      // التحقق مما إذا كان الزر معطلاً
      const isDisabled = await this.page.evaluate((button) => {
        return (
          button.disabled ||
          button.getAttribute("disabled") !== null ||
          button.classList.contains("disabled") ||
          window.getComputedStyle(button).opacity === "0.5" ||
          window.getComputedStyle(button).cursor === "not-allowed"
        );
      }, updateButton);

      if (isDisabled) {
        // محاولة معرفة سبب التعطيل
        const reason = await this.page.evaluate((button) => {
          const parent = button.closest("div");
          return parent ? parent.textContent : "";
        }, updateButton);

        throw new Error(`زر التحديث غير متاح حالياً: ${reason}`);
      }

      return true;
    } catch (error) {
      console.error("Update not available:", error);
      throw error;
    }
  }

  async clickUpdateButton(updateButton) {
    try {
      // أخذ screenshot قبل النقر للتحقق
      await this.page.screenshot({ path: "before_update.png" });

      // النقر على زر التحديث
      await updateButton.click();
      console.log("Clicked update button");

      // الانتظار لظهور نافذة التأكيد
      try {
        await this.page.waitForSelector(
          '.modal, .dialog, [role="dialog"], .popup, .overlay',
          {
            timeout: 5000,
          }
        );

        // البحث عن زر التأكيد والنقر عليه
        const confirmButtons = await this.page.$$("button");
        for (const button of confirmButtons) {
          const text = await this.page.evaluate((el) => el.textContent, button);
          if (
            text &&
            (text.includes("تأكيد") ||
              text.includes("نعم") ||
              text.includes("موافق") ||
              text.includes("تم") ||
              text.includes("Update") ||
              text.includes("Confirm"))
          ) {
            await button.click();
            console.log("Clicked confirm button");
            await this.wait(2000);
            break;
          }
        }
      } catch (modalError) {
        console.log("No confirmation modal appeared");
      }

      // انتظار اكتمال التحديث
      await this.wait(5000);

      // أخذ screenshot بعد النقر للتحقق
      await this.page.screenshot({ path: "after_update.png" });

      return true;
    } catch (error) {
      console.error("Error clicking update button:", error);
      throw error;
    }
  }

  async verifyUpdateSuccess() {
    try {
      // الانتظار لظهور أي رسالة نجاح أو خطأ
      await this.wait(3000);

      // البحث عن رسائل النجاح
      const success = await this.page.evaluate(() => {
        // البحث في كل العناصر عن رسالة نجاح
        const elements = document.querySelectorAll("*");
        for (let el of elements) {
          const text = el.textContent || "";
          if (
            text.includes("تم التحديث") ||
            text.includes("تم بنجاح") ||
            text.includes("تمت العملية") ||
            text.includes("تم تحديث الإعلان") ||
            text.includes("تمت إعادة النشر") ||
            text.includes("successful") ||
            text.includes("تمت بنجاح")
          ) {
            return true;
          }
        }
        return false;
      });

      if (success) {
        console.log("Update successful: Success message found");
        return true;
      }

      // البحث عن رسائل الخطأ
      const errorMsg = await this.page.evaluate(() => {
        const elements = document.querySelectorAll("*");
        for (let el of elements) {
          const text = el.textContent || "";
          if (
            text.includes("لا يمكن تحديث الإعلان") ||
            text.includes("بين ساعة وساعة") ||
            text.includes("غير متاح") ||
            text.includes("error") ||
            text.includes("فشل") ||
            text.includes("ممنوع") ||
            text.includes("محظور")
          ) {
            return text;
          }
        }
        return null;
      });

      if (errorMsg) {
        throw new Error(`Update failed: ${errorMsg}`);
      }

      // التحقق من أننا ما زلنا في صفحة الإعلان
      const currentUrl = await this.page.url();
      if (currentUrl.includes("/ad/")) {
        console.log("Update completed successfully (still on ad page)");
        return true;
      }

      // التحقق من تغيير حالة الزر
      const buttonState = await this.page.evaluate(() => {
        const buttons = document.querySelectorAll("button");
        for (let button of buttons) {
          const text = button.textContent || "";
          if (text.includes("تحديث") || text.includes("تجديد")) {
            return (
              window.getComputedStyle(button).opacity === "0.5" ||
              button.disabled ||
              button.getAttribute("disabled") !== null
            );
          }
        }
        return false;
      });

      if (buttonState) {
        console.log("Update successful: Button is now disabled");
        return true;
      }

      throw new Error(
        "Unable to verify update success - no clear indicators found"
      );
    } catch (error) {
      console.error("Error verifying update:", error);
      throw error;
    }
  }

  async updateAd(adId) {
    try {
      console.log(`Starting update process for ad: ${adId}`);

      // الانتقال إلى صفحة الإعلان
      await this.navigateToAdPage(adId);

      // البحث عن زر التحديث
      const updateButton = await this.findUpdateButton();

      // التحقق من توفر التحديث
      await this.checkUpdateAvailability(updateButton);

      // النقر على الزر
      await this.clickUpdateButton(updateButton);

      // التحقق من النجاح مع محاولات متعددة
      let success = false;
      let attempts = 0;

      while (!success && attempts < 3) {
        try {
          success = await this.verifyUpdateSuccess();
          if (!success) {
            attempts++;
            await this.wait(2000);
          }
        } catch (verifyError) {
          attempts++;
          if (attempts >= 3) {
            throw verifyError;
          }
          await this.wait(2000);
        }
      }

      if (success) {
        console.log(`Ad ${adId} updated successfully`);
        return {
          success: true,
          message: "تم تحديث الإعلان بنجاح",
          adId,
          timestamp: new Date().toISOString(),
        };
      }

      throw new Error(
        "Update completed but verification failed after multiple attempts"
      );
    } catch (error) {
      console.error(`Failed to update ad ${adId}:`, error);

      // أخذ screenshot للتحقق من الخطأ
      await this.page.screenshot({ path: `error_${adId}.png` });

      throw new Error(`فشل في تحديث الإعلان: ${error.message}`);
    }
  }

async updateAllAds() {
  try {
    console.log("Starting to update all ads...");

    // جلب جميع الإعلانات
    const ads = await this.getMyAds();

    if (ads.length === 0) {
      console.log("No ads found to update");
      return { success: true, updated: 0, total: 0 };
    }

    console.log(`Found ${ads.length} ads to process`);

    let successfulUpdates = 0;
    const results = [];

    for (const ad of ads) {
      try {
        if (ad.status !== 'active') {
          console.log(`Skipping inactive ad: ${ad.adId}`);
          results.push({
            adId: ad.adId,
            status: 'skipped',
            message: 'الإعلان غير نشط'
          });
          continue;
        }

        console.log(`Processing ad: ${ad.adId} - ${ad.title}`);

        const result = await this.updateAd(ad.adId);

        if (result.success) {
          successfulUpdates++;
          results.push({
            adId: ad.adId,
            status: 'success',
            message: result.message
          });
        } else {
          results.push({
            adId: ad.adId,
            status: 'failed',
            message: result.message
          });
        }

        // التحقق من القيود الزمنية
        const waitTime = await this.handleUpdateLimitations();
        if (waitTime > 0) {
          console.log(`Update limited, waiting ${waitTime/1000/60} minutes`);
          await this.wait(waitTime);
          break; // إيقاف التحديثات الإضافية
        }

        // انتظار عشوائي بين الإعلانات
        const randomWait = Math.floor(Math.random() * 90000) + 30000;
        console.log(`Waiting ${randomWait/1000} seconds before next ad...`);
        await this.wait(randomWait);

      } catch (error) {
        console.error(`Error updating ad ${ad.adId}:`, error);
        results.push({
          adId: ad.adId,
          status: 'error',
          message: error.message
        });
        
        // في حالة الخطأ، انتظار فترة أطول
        await this.wait(120000);
      }
    }

    console.log(`Update process completed. Successful: ${successfulUpdates}/${ads.length}`);
    return {
      success: true,
      updated: successfulUpdates,
      total: ads.length,
      results: results
    };
  } catch (error) {
    console.error("Error in updateAllAds:", error);
    throw error;
  }
}

  async scheduleRandomUpdates() {
    try {
      // حساب وقت عشوائي بين 20-48 ساعة
      const randomHours = Math.floor(Math.random() * 29) + 20;
      const randomMs = randomHours * 60 * 60 * 1000;

      console.log(
        `Scheduling next update in ${randomHours} hours (${randomMs}ms)`
      );

      // إلغاء أي جدولة سابقة
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }

      // جدولة التحديث التالي
      this.updateTimeout = setTimeout(async () => {
        try {
          console.log("Auto-update triggered by scheduler");
          await this.updateAllAds();

          // جدولة التحديث التالي بعد الانتهاء
          await this.scheduleRandomUpdates();
        } catch (error) {
          console.error("Error in scheduled update:", error);
          // إعادة الجدولة في حالة الخطأ (بعد ساعة)
          setTimeout(() => this.scheduleRandomUpdates(), 60 * 60 * 1000);
        }
      }, randomMs);

      return {
        success: true,
        nextUpdate: new Date(Date.now() + randomMs),
        hours: randomHours,
      };
    } catch (error) {
      console.error("Error scheduling updates:", error);
      throw error;
    }
  }

  // بدء نظام التحديث التلقائي
  async startAutoUpdate() {
    try {
      console.log("Starting auto-update system...");

      // التأكد من أن البوت يعمل
      await this.ensureBotRunning();

      // بدء الجدولة
      const scheduleResult = await this.scheduleRandomUpdates();

      console.log("Auto-update system started successfully");
      return scheduleResult;
    } catch (error) {
      console.error("Failed to start auto-update system:", error);
      throw error;
    }
  }

  // إيقاف نظام التحديث التلقائي
  stopAutoUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
      this.updateTimeout = null;
      console.log("Auto-update system stopped");
    }

    return { success: true, message: "Auto-update stopped" };
  }

  // الحصول على حالة النظام
  getSchedulerStatus() {
    if (this.updateTimeout) {
      const nextUpdate = new Date(Date.now() + this.updateTimeout._idleTimeout);
      return {
        isRunning: true,
        nextUpdate: nextUpdate,
        timeoutMs: this.updateTimeout._idleTimeout,
      };
    }

    return { isRunning: false };
  }

  async ensureBotRunning() {
    try {
      console.log("Ensuring bot is running...");

      // إذا كان المتصفح غير موجود أو مغلق
      if (!this.browser) {
        console.log("Browser not found, initializing...");
        await this.initBrowser();
        return true;
      }

      // إذا كانت الصفحة غير موجودة أو مغلقة
      if (!this.page || this.page.isClosed()) {
        console.log("Page not found or closed, creating new page...");
        this.page = await this.browser.newPage();

        // إعادة تطبيق الإعدادات
        await this.page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );
        await this.page.setExtraHTTPHeaders({
          "Accept-Language": "ar,en;q=0.9",
        });

        // تحميل الكوكيز إذا كانت موجودة
        await this.loadCookies();
      }

      // التحقق من تسجيل الدخول
      const isLoggedIn = await this.checkLoginStatus();

      if (!isLoggedIn) {
        console.log("Not logged in, attempting login...");
        await this.loginToAqar();
      }

      console.log("✅ Bot is running and ready");
      return true;
    } catch (error) {
      console.error("Error ensuring bot is running:", error);

      // محاولة إعادة التشغيل الكامل
      try {
        await this.stop();
        await this.initBrowser();
        return await this.checkLoginStatus();
      } catch (restartError) {
        console.error("Complete restart failed:", restartError);
        throw new Error(
          "Failed to ensure bot is running: " + restartError.message
        );
      }
    }
  }

  async stop() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }

  async validateAdOwnership(adId, forceCheck = false) {
    try {
      // إذا لم نكن بحاجة للتحقق القوي، نعود مباشرة
      if (!forceCheck) {
        console.log(`Skipping ownership validation for ad: ${adId}`);
        return true;
      }

      // التحقق من قاعدة البيانات أولاً
      const userAds = await Ad.find({ userId: this.userId, isUserAd: true });
      const isOwned = userAds.some((ad) => ad.adId === adId);

      if (isOwned) {
        console.log(`Ad ${adId} is owned by user`);
        return true;
      }

      // إذا لم يكن في قاعدة البيانات، التحقق من الموقع
      console.log(`Checking ad ownership on website: ${adId}`);
      await this.navigateToUserAds();
      const currentUserAds = await this.extractAdsData();

      return currentUserAds.some((ad) => ad.adId === adId);
    } catch (error) {
      console.error("Error validating ad ownership:", error);
      return false;
    }
  }

  async navigateToAdCommunicationRequests(
    adId,
    userId = null,
    skipValidation = false
  ) {
    try {
      console.log(`Navigating to communication requests for ad: ${adId}`);

      // التحقق من صحة adId
      if (!adId || isNaN(adId)) {
        throw new Error(`Invalid adId: ${adId}`);
      }

      // إذا كان userId متوفراً، التحقق من ملكية الإعلان (مع إمكانية تخطي التحقق)
      if (userId && !skipValidation) {
        const isValid = await this.validateAdOwnership(adId, true);
        if (!isValid) {
          throw new Error(`Ad ${adId} does not belong to user`);
        }
      }

      // بناء الرابط المباشر
      const targetUrl = `https://sa.aqar.fm/listings/${adId}/communication-requests`;
      console.log(`Navigating to: ${targetUrl}`);

      await this.page.goto(targetUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // التحقق من أننا في الصفحة الصحيحة
      const currentUrl = await this.page.url();
      if (!currentUrl.includes(`/listings/${adId}/communication-requests`)) {
        console.warn(`Possible navigation issue. Current URL: ${currentUrl}`);

        // محاولة التصحيح التلقائي
        const correctAdId = await this.extractAdIdFromCommunicationPage();
        if (correctAdId && correctAdId !== adId) {
          console.log(`Correcting adId from ${adId} to ${correctAdId}`);
          return await this.navigateToAdCommunicationRequests(
            correctAdId,
            userId,
            skipValidation
          );
        }
      }

      // انتظار تحميل الصفحة
      await this.page.waitForSelector(
        "._communications__Dx82y, ._requestCard__uj_k6",
        {
          timeout: 20000,
        }
      );

      console.log("Successfully navigated to communication requests");
      return true;
    } catch (error) {
      console.error("Error navigating to communication requests:", error);
      throw error;
    }
  }

  async extractNewMessages() {
    try {
      console.log("Extracting messages from communication page...");

      const messages = await this.page.evaluate(() => {
        const messageCards = document.querySelectorAll("._requestCard__uj_k6");
        const messagesData = [];

        messageCards.forEach((card, index) => {
          try {
            // استخراج بيانات المرسل
            const senderElement = card.querySelector("p:first-child");
            const senderName = senderElement
              ? senderElement.textContent.trim()
              : "Unknown";

            // استخراج التاريخ
            const dateElement = card.querySelector("p:not(:first-child)");
            const receivedDate = dateElement
              ? dateElement.textContent.trim()
              : "";

            // التحقق من حالة الرسالة (جديدة/تم الرد)
            const statusElement = card.querySelector(
              "._status__cGrCS, ._contacted__ldMj3"
            );
            const isNew =
              !statusElement ||
              !statusElement.textContent.includes("تم التواصل");

            // التحقق من توفر الواتساب
            const whatsappButton = card.querySelector(
              'button:has-text("واتساب")'
            );
            const isWhatsappAvailable =
              !!whatsappButton && !whatsappButton.disabled;

            // محاولة استخراج adId من الصفحة
            let adId = null;
            const currentUrl = window.location.href;
            const urlMatch = currentUrl.match(/\/listings\/(\d+)/);
            if (urlMatch) adId = urlMatch[1];

            messagesData.push({
              messageId: `msg-${index}-${Date.now()}`,
              senderName,
              receivedDate,
              isNew,
              isWhatsappAvailable,
              adId, // إضافة adId إلى بيانات الرسالة
            });
          } catch (error) {
            console.error("Error extracting message:", error);
          }
        });

        return messagesData;
      });

      console.log(`Extracted ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error("Error extracting messages:", error);
      throw error;
    }
  }

  async extractAdIdFromCommunicationPage() {
    try {
      console.log("Extracting adId from communication requests page...");

      const adId = await this.page.evaluate(() => {
        // الطريقة 1: من الرابط الحالي (الأكثر موثوقية)
        const currentUrl = window.location.href;
        const adIdMatch = currentUrl.match(
          /\/listings\/(\d+)\/communication-requests/
        );
        if (adIdMatch) return adIdMatch[1];

        // الطريقة 2: من عناصر الصفحة (breadcrumb أو عناوين)
        const breadcrumbLinks = document.querySelectorAll(
          'a[href*="/ad/"], a[href*="/listings/"]'
        );
        for (const link of breadcrumbLinks) {
          const href = link.getAttribute("href");
          const match = href.match(/\/(\d+)/);
          if (match) return match[1];
        }

        // الطريقة 3: من عناوين الصفحة أو البيانات
        const pageTitle = document.title;
        const titleMatch = pageTitle.match(/(\d{6,})/); // البحث عن أرقام طويلة
        if (titleMatch) return titleMatch[1];

        // الطريقة 4: من بيانات JavaScript في الصفحة
        const scripts = document.querySelectorAll("script");
        for (const script of scripts) {
          const scriptContent = script.textContent || "";
          const matches =
            scriptContent.match(/"adId":\s*"(\d+)"/) ||
            scriptContent.match(/"listingId":\s*"(\d+)"/);
          if (matches) return matches[1];
        }

        return null;
      });

      if (adId) {
        console.log(`Extracted adId from communication page: ${adId}`);

        // التحقق من أن هذا الإعلان مملوك للمستخدم
        const isValid = await this.validateAdOwnership(adId);
        if (isValid) {
          return adId;
        } else {
          throw new Error(`الإعلان ${adId} لا ينتمي إلى المستخدم`);
        }
      }

      throw new Error("Could not extract adId from communication page");
    } catch (error) {
      console.error("Error extracting adId from communication page:", error);

      // محاولة بديلة: العودة إلى صفحة الإعلانات واستخراج من هناك
      try {
        await this.navigateToUserAds();
        const userAds = await this.extractAdsData();
        if (userAds.length > 0) {
          console.log(`Using first user ad: ${userAds[0].adId}`);
          return userAds[0].adId;
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }

      throw error;
    }
  }

  async extractAdIdFromAdPage() {
    try {
      console.log("Extracting adId from ad page...");

      const adId = await this.page.evaluate(() => {
        // من الرابط الحالي
        const currentUrl = window.location.href;
        const adIdMatch = currentUrl.match(/\/ad\/(\d+)/);
        if (adIdMatch) return adIdMatch[1];

        // من عناصر الصفحة
        const adIdElement = document.querySelector(
          "[data-ad-id], [data-listing-id]"
        );
        if (adIdElement) {
          return (
            adIdElement.getAttribute("data-ad-id") ||
            adIdElement.getAttribute("data-listing-id")
          );
        }

        return null;
      });

      if (adId) {
        console.log(`Extracted adId from ad page: ${adId}`);
        return adId;
      }

      throw new Error("Could not extract adId from ad page");
    } catch (error) {
      console.error("Error extracting adId from ad page:", error);
      throw error;
    }
  }

  // دالة للتحقق من ملكية الإعلان
  async validateAdOwnership(adId) {
    try {
      // التحقق من قاعدة البيانات أولاً
      const userAds = await Ad.find({ userId: this.userId, isUserAd: true });
      const isOwned = userAds.some((ad) => ad.adId === adId);

      if (isOwned) {
        console.log(`Ad ${adId} is owned by user`);
        return true;
      }

      // إذا لم يكن في قاعدة البيانات، التحقق من الموقع
      console.log(`Checking ad ownership on website: ${adId}`);
      await this.navigateToUserAds();
      const currentUserAds = await this.extractAdsData();

      return currentUserAds.some((ad) => ad.adId === adId);
    } catch (error) {
      console.error("Error validating ad ownership:", error);
      return false;
    }
  }

  async clickWhatsappButton(messageElement) {
    try {
      console.log("Clicking WhatsApp button...");

      // البحث عن زر الواتساب ضمن عنصر الرسالة المحدد
      const whatsappButton = await messageElement.$(
        'button:has-text("واتساب")'
      );

      if (!whatsappButton) {
        throw new Error("زر الواتساب غير موجود في هذه الرسالة");
      }

      // النقر على زر الواتساب
      await whatsappButton.click();

      // الانتظار لفتح نافذة الواتساب
      await this.wait(3000);

      // الحصول على جميع النوافذ/Tabs المفتوحة
      const pages = await this.browser.pages();
      const whatsappPage = pages.find(
        (page) =>
          page.url().includes("web.whatsapp.com") ||
          page.url().includes("api.whatsapp.com")
      );

      if (!whatsappPage) {
        throw new Error("لم يتم فتح الواتساب");
      }

      // الانتقال إلى صفحة الواتساب
      await whatsappPage.bringToFront();

      console.log("WhatsApp opened successfully");
      return whatsappPage;
    } catch (error) {
      console.error("Error clicking WhatsApp button:", error);
      throw error;
    }
  }

  async sendWhatsappMessage(whatsappPage, message) {
    try {
      console.log("Sending WhatsApp message...");

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

      // مسح أي نص موجود أولاً
      await whatsappPage.keyboard.down("Control");
      await whatsappPage.keyboard.press("A");
      await whatsappPage.keyboard.up("Control");
      await whatsappPage.keyboard.press("Backspace");

      // كتابة الرسالة
      await whatsappPage.keyboard.type(message);

      // إرسال الرسالة
      await whatsappPage.keyboard.press("Enter");

      console.log("Message sent successfully");

      // العودة إلى الصفحة الرئيسية
      await this.page.bringToFront();

      return true;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);

      // العودة إلى الصفحة الرئيسية في حالة الخطأ
      await this.page.bringToFront();
      throw error;
    }
  }

  async selectReplyTemplate(message) {
    // قوالب الردود الجاهزة
    const templates = {
      greeting:
        "السلام عليكم ورحمة الله وبركاته 🌹\nشكراً لتواصلكم، كيف يمكنني مساعدتك؟",
      price:
        "أهلاً وسهلاً بك 🌹\nالسعر المذكور في الإعلان نهائي وقابل للتفاوض حسب الظروف.\nهل ترغب في معرفة المزيد من التفاصيل؟",
      availability:
        "أهلاً بك 🌹\nنعم، الإعلان لا يزال متاح.\nهل ترغب في الترتيب لمعاينة أو لديك استفسار محدد؟",
      location:
        "وعليكم السلام ورحمة الله 🌹\nالمكان موضح في الخريطة في الإعلان.\nهل تحتاج إلى اتجاهات محددة أو معلومات عن الموقع؟",
      default:
        "السلام عليكم 🌹\nشكراً لاهتمامك بالإعلان.\nهل لديك استفسار محدد أو ترغب في معرفة المزيد من التفاصيل؟",
    };

    // تحليل محتوى الرسالة لتحديد الرد المناسب
    const messageContent = message.messageContent?.toLowerCase() || "";

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

  async processNewMessages(adId = null, userId = null) {
    try {
      console.log(`Processing messages${adId ? " for ad: " + adId : ""}`);

      if (!this.page) {
        throw new Error("الصفحة غير مفتوحة، الرجاء تشغيل الروبوت أولاً");
      }

      let targetAdId = adId;
      this.userId = userId; // حفظ userId للتحقق لاحقاً

      // إذا لم يتم توفير adId، نستخرجه من الصفحة الحالية
      const currentUrl = await this.page.url();
      console.log("Current URL:", currentUrl);

      if (!targetAdId) {
        if (currentUrl.includes("/communication-requests")) {
          targetAdId = await this.extractAdIdFromCommunicationPage();
        } else if (currentUrl.includes("/ad/")) {
          targetAdId = await this.extractAdIdFromAdPage();
        } else {
          await this.navigateToUserAds();
          const userAds = await this.extractAdsData();
          if (userAds.length > 0) {
            targetAdId = userAds[0].adId;
            console.log(`Using first user ad: ${targetAdId}`);
          } else {
            throw new Error("No user ads found");
          }
        }
      }

      // الانتقال إلى صفحة طلبات التواصل مع تخطي التحقق من الملكية
      await this.navigateToAdCommunicationRequests(targetAdId, userId, true);
      const messages = await this.extractNewMessages();
      const newMessages = messages.filter(
        (msg) => msg.isNew && msg.isWhatsappAvailable
      );

      console.log(
        `Found ${newMessages.length} new messages for ad ${targetAdId}`
      );

      const results = [];
      for (const message of newMessages) {
        try {
          const result = await this.processSingleMessage(message);
          results.push({
            ...result,
            adId: targetAdId,
          });

          await this.wait(2000);
        } catch (error) {
          console.error(`Failed to process message:`, error);
          results.push({
            success: false,
            messageId: message.messageId,
            error: error.message,
            adId: targetAdId,
          });
        }
      }

      return {
        processed: newMessages.length,
        success: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        details: results,
        adId: targetAdId,
      };
    } catch (error) {
      console.error("Error processing messages:", error);
      throw error;
    }
  }

  async debugCurrentPage() {
    try {
      const pageInfo = await this.page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          hasCommunications: !!document.querySelector(
            "._communications__Dx82y"
          ),
          requestCards: document.querySelectorAll("._requestCard__uj_k6")
            .length,
          allButtons: Array.from(document.querySelectorAll("button")).map(
            (btn) => ({
              text: btn.textContent,
              disabled: btn.disabled,
            })
          ),
        };
      });

      console.log("Page debug info:", pageInfo);
      return pageInfo;
    } catch (error) {
      console.error("Error debugging page:", error);
      return null;
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
