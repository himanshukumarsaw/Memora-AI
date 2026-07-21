import api from './apiClient';

export const opportunityService = {
  getOpportunities: () => api.get('/opportunities'),
  checkEligibility: () => api.post('/opportunities/check'),
};
