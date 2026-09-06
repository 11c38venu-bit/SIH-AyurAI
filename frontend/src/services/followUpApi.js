import apiClient from './apiClient';

export const followUpApi = {
  async createFollowUp(followUpData) {
    const response = await apiClient.post('/follow-ups/', followUpData);
    return response.data;
  },

  async getUpcomingFollowUps(params = {}) {
    const response = await apiClient.get('/follow-ups/upcoming', { params });
    return response.data;
  },

  async getFollowUp(followUpId) {
    const response = await apiClient.get(`/follow-ups/${followUpId}`);
    return response.data;
  },

  async getPatientFollowUps(patientId) {
    const response = await apiClient.get(`/follow-ups/patient/${patientId}`);
    return response.data;
  },

  async getPatientWorkspace(patientId) {
    const response = await apiClient.get(`/follow-ups/workspace/patient/${patientId}`);
    return response.data;
  },

  async updateFollowUp(followUpId, updateData) {
    const response = await apiClient.patch(`/follow-ups/${followUpId}`, updateData);
    return response.data;
  },

  async confirmFollowUp(followUpId, confirmData = {}) {
    const response = await apiClient.post(`/follow-ups/${followUpId}/confirm`, confirmData);
    return response.data;
  },

  async completeFollowUp(followUpId, completeData = {}) {
    const response = await apiClient.post(`/follow-ups/${followUpId}/complete`, completeData);
    return response.data;
  },

  async markMissed(followUpId, missedData = {}) {
    const response = await apiClient.post(`/follow-ups/${followUpId}/missed`, missedData);
    return response.data;
  },

  async cancelFollowUp(followUpId, cancellationReason) {
    const response = await apiClient.post(`/follow-ups/${followUpId}/cancel`, {
      cancellation_reason: cancellationReason,
    });
    return response.data;
  },

  async recordFollowUpVisit(followUpId, visitData) {
    const response = await apiClient.post(`/follow-ups/${followUpId}/visits`, visitData);
    return response.data;
  },
};

export default followUpApi;
