import api from './apiClient';

export const knowledgeGraphService = {
  getNodes: () => api.get('/graph/nodes'),
  queryGraph: (question) => api.post('/graph/query', { question }),
};
