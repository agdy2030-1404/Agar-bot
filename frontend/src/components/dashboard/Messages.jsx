import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const messageService = {
  getMessages: (params) => api.get('/api/messages', { params }),
  fetchMessages: () => api.get('/api/messages/fetch'),
  createTemplate: (data) => api.post('/api/messages/templates', data),
  getTemplates: () => api.get('/api/messages/templates'),
  updateAutoReply: (data) => api.post('/api/messages/settings', data),
};

export default messageService;