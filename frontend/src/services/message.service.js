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
      console.error('غير مصرح به - يرجى تسجيل الدخول مرة أخرى');
    }
    return Promise.reject(error);
  }
);

export const messageService = {
  getMessages: (params) => api.get('/api/messages', { params }),
  fetchMessages: () => api.get('/api/messages/fetch'),
  createTemplate: (data) => api.post('/api/messages/templates', data),
  getTemplates: () => api.get('/api/messages/templates'),
  updateAutoReply: (data) => api.post('/api/messages/settings', data),
  updateTemplate: (id, data) => api.put(`/api/messages/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`/api/messages/templates/${id}`),
};

export default messageService;