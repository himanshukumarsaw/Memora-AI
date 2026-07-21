import api from './apiClient';

export const documentService = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  uploadDocument: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  renameDocument: (id, title) => api.patch(`/documents/${id}/name`, { title }),
  updateCategory: (id, category) => api.patch(`/documents/${id}/category`, { category }),
  toggleFavorite: (id) => api.patch(`/documents/${id}/favorite`),
  toggleArchive: (id) => api.patch(`/documents/${id}/archive`),
  getDashboardStats: () => api.get('/documents/dashboard/stats'),
  previewDocument: (id) => api.get(`/documents/${id}/preview`),
};
