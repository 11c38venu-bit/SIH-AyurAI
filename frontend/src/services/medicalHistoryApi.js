import apiClient from './apiClient';

export const medicalHistoryApi = {
  async getPatientHistory(patientId) {
    const response = await apiClient.get(`/medical-history/patient/${patientId}`);
    return response.data;
  },

  async getHistoryById(historyId) {
    const response = await apiClient.get(`/medical-history/${historyId}`);
    return response.data;
  },

  async createHistory(historyData) {
    const response = await apiClient.post('/medical-history/', historyData);
    return response.data;
  },

  async updateHistory(historyId, updateData) {
    const response = await apiClient.patch(`/medical-history/${historyId}`, updateData);
    return response.data;
  },
};

export default medicalHistoryApi;
