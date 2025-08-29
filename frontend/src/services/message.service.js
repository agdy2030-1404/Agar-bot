import axios from "axios";

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
  const res = await axios.post(`${API_URL}/api/messages/process-all`, {}, {
    withCredentials: true,
  });
  return res.data;
};

// جلب القوالب
const getTemplates = async () => {
  const res = await axios.get(`${API_URL}/api/messages/templates`, {
    withCredentials: true,
  });
  return res.data;
};

// إنشاء قالب جديد
const createTemplate = async (template) => {
  const res = await axios.post(`${API_URL}/api/messages/templates`, template, {
    withCredentials: true,
  });
  return res.data;
};

// جلب إعلانات المستخدم
const getUserAds = async () => {
  const res = await axios.get(`${API_URL}/api/messages/ads`, {
    withCredentials: true,
  });
  return res.data;
};

export default {
  getMessages,
  processMessages,
  processAllMessages, // جديد
  getTemplates,
  createTemplate,
  getUserAds, // جديد
};