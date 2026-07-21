import api from './apiClient';

export const timelineService = {
  getTimeline: (params) => api.get('/timeline', { params }),
  createMilestone: (data) => api.post('/timeline', data),
  deleteMilestone: (id) => api.delete(`/timeline/${id}`),
};
