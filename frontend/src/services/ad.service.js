import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const adService = {
  // جلب إعلانات المستخدم مع التحقق
  getMyAds: async () => {
    try {
      // التحقق من حالة الروبوت أولاً
      const statusResponse = await botService.getStatus();

      if (!statusResponse.data.isRunning) {
        throw new Error("الروبوت غير نشط");
      }

      if (!statusResponse.data.isLoggedIn) {
        throw new Error("المستخدم غير مسجل");
      }

      // فقط إذا كان كل شيء جيداً، نجلب الإعلانات
      return api.get("/api/ads");
    } catch (error) {
      throw error;
    }
  },

  // جلب إعلانات من الموقع وحفظها
  fetchAdsFromSite: () => api.get("/api/ads/fetch"),

  // تفاصيل إعلان معين
  getAdDetails: (adId) => api.get(`/api/ads/${adId}`),

  // تحديث إعلان
  updateAd: (adId) => api.put(`/api/ads/${adId}/update`), // ✅ المسار الصحيح

  // جدولة التحديثات
  scheduleAdUpdates: (adId, scheduleData) =>
    api.post(`/api/ads/${adId}/schedule`, scheduleData),

  // إحصائيات الإعلانات
  getAdStats: () => api.get("/api/ads/stats"),
};

export default adService;
