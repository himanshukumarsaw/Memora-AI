import api from './apiClient';

export const chatService = {
  sendMessage: (question, conversationId) => api.post('/chat/message', { question, conversationId }),
  getSessions: () => api.get('/chat/sessions'),
  getSession: (id) => api.get(`/chat/sessions/${id}`),
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
};

export const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

export const reminderService = {
  getReminders: (status) => api.get('/reminders', { params: { status } }),
  createReminder: (data) => api.post('/reminders', data),
  updateReminder: (id, data) => api.put(`/reminders/${id}`, data),
  deleteReminder: (id) => api.delete(`/reminders/${id}`),
  snoozeReminder: (id, hours) => api.patch(`/reminders/${id}/snooze`, { hours }),
};

export const shareService = {
  createShareLink: (documentId, options) => api.post('/share', { documentId, ...options }),
  getSharedDocument: (token, otp) => api.get(`/share/access/${token}`, { params: { otp } }),
  revokeShare: (shareId) => api.delete(`/share/${shareId}`),
};

export const resumeService = {
  generateResume: () => api.post('/resume'),
  downloadResume: (id) => api.get(`/resume/${id}`, { responseType: 'blob' }),
};

export const autofillService = {
  analyzeForm: (formData) => api.post('/autofill/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSuggestedFields: (id) => api.get(`/autofill/${id}`),
  exportFilledForm: (formId, fields) => api.post('/autofill/export', { formId, fields }, { responseType: 'blob' }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getDocuments: (params) => api.get('/admin/documents', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};
