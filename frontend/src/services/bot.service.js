import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // يمكنك إضافة redirect إلى login هنا إذا لزم الأمر
      console.error('غير مصرح به - يرجى تسجيل الدخول مرة أخرى');
    }
    return Promise.reject(error);
  }
);

export const botService = {
  getStatus: () => api.get('/api/bot/status'),
  start: () => api.post('/api/bot/start'),
  stop: () => api.post('/api/bot/stop'),
  fetchAds: () => api.get('/api/ads/fetch'),
  getAds: (params) => api.get('/api/ads', { params }),
  updateAd: (adId) => api.post(`/api/ads/${adId}/update`),
  scheduleUpdates: (data) => api.post('/api/ads/schedule-updates', data),
};

export default botService;