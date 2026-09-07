import apiClient from './apiClient';

export const progressApi = {
  async createProgressRecord(progressData) {
    const response = await apiClient.post('/progress/', progressData);
    return response.data;
  },

  async getProgress(progressId) {
    const response = await apiClient.get(`/progress/${progressId}`);
    return response.data;
  },

  async getPatientProgressRecords(patientId) {
    const response = await apiClient.get(`/progress/patient/${patientId}`);
    return response.data;
  },

  async getVisitProgress(visitId) {
    const response = await apiClient.get(`/progress/visit/${visitId}`);
    return response.data;
  },

  async getPatientTimeline(patientId) {
    const response = await apiClient.get(`/progress/patient/${patientId}/timeline`);
    return response.data;
  },

  async getPatientSummary(patientId) {
    const response = await apiClient.get(`/progress/patient/${patientId}/summary`);
    return response.data;
  },

  async getPatientComparison(patientId, params = {}) {
    const response = await apiClient.get(`/progress/patient/${patientId}/compare`, { params });
    return response.data;
  },

  async getPatientWorkspace(patientId) {
    const response = await apiClient.get(`/progress/workspace/patient/${patientId}`);
    return response.data;
  },

  async updateProgressRecord(progressId, updateData) {
    const response = await apiClient.patch(`/progress/${progressId}`, updateData);
    return response.data;
  },
};

export default progressApi;
