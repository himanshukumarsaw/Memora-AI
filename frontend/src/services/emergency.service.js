import api from './apiClient';

export const emergencyService = {
  getProfile: () => api.get('/emergency/profile'),
  updateProfile: (data) => api.put('/emergency/profile', data),
  getPublicProfile: (qrToken) => api.get(`/emergency/public/${qrToken}`),
};
