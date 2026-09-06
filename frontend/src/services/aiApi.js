import apiClient from './apiClient';

export const aiApi = {
  async processCaseResponse(caseResponseId) {
    const response = await apiClient.post(`/ai-case/responses/${caseResponseId}/process`);
    return response.data;
  },

  async getAiCaseResponse(caseResponseId) {
    const response = await apiClient.get(`/ai-case/responses/${caseResponseId}`);
    return response.data;
  },

  async reviewAiCaseResponse(caseResponseId, reviewData) {
    const response = await apiClient.patch(`/ai-case/responses/${caseResponseId}/review`, reviewData);
    return response.data;
  },

  async generateCaseSummary(caseId) {
    const response = await apiClient.post(`/ai-case/cases/${caseId}/generate-summary`);
    return response.data;
  },

  async getCaseSummary(caseId) {
    const response = await apiClient.get(`/ai-case/cases/${caseId}/summary`);
    return response.data;
  },

  async reviewCaseSummary(caseId, reviewData) {
    const response = await apiClient.patch(`/ai-case/cases/${caseId}/summary/review`, reviewData);
    return response.data;
  },
};

export default aiApi;
