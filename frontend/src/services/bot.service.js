import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("غير مصرح به - يرجى تسجيل الدخول مرة أخرى");
    }
    return Promise.reject(error);
  }
);

export const botService = {
  // وظائف الروبوت
  getStatus: () => api.get("/api/bot/status"),
  start: () => api.post("/api/bot/start"),
  stop: () => api.post("/api/bot/stop"),
  checkLoginStatus: () => api.get("/api/bot/login-status"),

  // وظائف الإعلانات
  fetchAds: () => api.get("/api/ads/fetch"),
  getAds: (params) => api.get("/api/ads", { params }),
  getAdDetails: (adId) => api.get(`/api/ads/${adId}`),
  updateAd: (adId) => api.post(`/api/ads/${adId}/update`),
  scheduleUpdates: (data) => api.post("/api/ads/schedule-updates", data),
  startAutoUpdate: () => api.post("/api/bot/auto-update/start"),

  // إيقاف التحديث التلقائي
  stopAutoUpdate: () => api.post("/api/bot/auto-update/stop"),

  // الحصول على حالة النظام
  getSchedulerStatus: () => api.get("/api/bot/auto-update/status"),

  // تحديث جميع الإعلانات يدوياً
  updateAllAds: () => api.post("/api/bot/ads/update-all"),
};

export default botService;
