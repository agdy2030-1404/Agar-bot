import axios from "axios";
import botService from "./bot.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// جلب الرسائل
const getMessages = async (status = "", page = 1, limit = 20) => {
  const params = new URLSearchParams();

  if (status) params.append("status", status);
  params.append("page", page);
  params.append("limit", limit);

  const res = await axios.get(`${API_URL}/api/messages?${params.toString()}`, {
    withCredentials: true,
  });

  return res.data;
};

// تشغيل المعالجة التلقائية
const processMessages = async (adId = null) => {
  let url = `${API_URL}/api/messages/process`;

  if (adId) {
    url = `${API_URL}/api/messages/process/${adId}`;
  }

  const res = await axios.post(url, {}, { withCredentials: true });
  return res.data;
};

// معالجة جميع الإعلانات
const processAllMessages = async () => {
  const res = await axios.post(
    `${API_URL}/api/messages/process-all`,
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};

// جلب إعلانات المستخدم

const getUserAds = async () => {
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
    return api.get("/api/messages/ads");
  } catch (error) {
    throw error;
  }
};

export default {
  getMessages,
  processMessages,
  processAllMessages, // جديد
  getUserAds,
};
