import apiClient from './apiClient';

export const ayurvedicApi = {
  async createAssessment(assessmentData) {
    const response = await apiClient.post('/ayurvedic-assessments/', assessmentData);
    return response.data;
  },

  async getAssessment(assessmentId) {
    const response = await apiClient.get(`/ayurvedic-assessments/${assessmentId}`);
    return response.data;
  },

  async getPatientAssessments(patientId) {
    const response = await apiClient.get(`/ayurvedic-assessments/patient/${patientId}`);
    return response.data;
  },

  async getCaseAssessment(caseId) {
    const response = await apiClient.get(`/ayurvedic-assessments/case/${caseId}`);
    return response.data;
  },

  async updateAssessment(assessmentId, updateData) {
    const response = await apiClient.patch(`/ayurvedic-assessments/${assessmentId}`, updateData);
    return response.data;
  },

  async saveAshtavidha(assessmentId, ashtavidhaData) {
    const response = await apiClient.post(`/ayurvedic-assessments/${assessmentId}/ashtavidha`, ashtavidhaData);
    return response.data;
  },

  async saveDashavidha(assessmentId, dashavidhaData) {
    const response = await apiClient.post(`/ayurvedic-assessments/${assessmentId}/dashavidha`, dashavidhaData);
    return response.data;
  },
};

export default ayurvedicApi;
