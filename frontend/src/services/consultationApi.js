import apiClient from './apiClient';

export const consultationApi = {
  async startConsultation(consultationData) {
    const response = await apiClient.post('/consultations/', consultationData);
    return response.data;
  },

  async getConsultation(consultationId) {
    const response = await apiClient.get(`/consultations/${consultationId}`);
    return response.data;
  },

  async getPatientConsultations(patientId) {
    const response = await apiClient.get(`/consultations/patient/${patientId}`);
    return response.data;
  },

  async getCaseConsultation(caseId) {
    const response = await apiClient.get(`/consultations/case/${caseId}`);
    return response.data;
  },

  async updateConsultation(consultationId, updateData) {
    const response = await apiClient.patch(`/consultations/${consultationId}`, updateData);
    return response.data;
  },

  async completeConsultation(consultationId, completeData = {}) {
    const response = await apiClient.patch(`/consultations/${consultationId}/complete`, completeData);
    return response.data;
  },

  async cancelConsultation(consultationId, cancellationReason) {
    const response = await apiClient.patch(`/consultations/${consultationId}/cancel`, {
      cancellation_reason: cancellationReason,
    });
    return response.data;
  },

  async getCaseWorkspace(caseId) {
    const response = await apiClient.get(`/consultations/workspace/case/${caseId}`);
    return response.data;
  },
};

export default consultationApi;
