import apiClient from './apiClient';

export const caseApi = {
  async getQuestions(category = null) {
    const params = {};
    if (category) params.category = category;
    const response = await apiClient.get('/cases/questions', { params });
    return response.data;
  },

  async createSession({ patient_id, queue_id = null, notes = null }) {
    const response = await apiClient.post('/cases/', {
      patient_id: Number(patient_id),
      queue_id: queue_id ? Number(queue_id) : null,
      notes,
    });
    return response.data;
  },

  async getSession(caseId) {
    const response = await apiClient.get(`/cases/${caseId}`);
    return response.data;
  },

  async getPatientSessions(patientId) {
    const response = await apiClient.get(`/cases/patient/${patientId}`);
    return response.data;
  },

  async updateSessionStatus(caseId, status) {
    const response = await apiClient.patch(`/cases/${caseId}/status`, {
      status: status.toUpperCase(),
    });
    return response.data;
  },

  async submitResponse(caseId, { question_id, original_response, response_language = 'en', notes = null }) {
    const response = await apiClient.post(`/cases/${caseId}/responses`, {
      question_id: Number(question_id),
      original_response,
      response_language,
      notes,
    });
    return response.data;
  },

  async updateResponse(caseId, responseId, updateData) {
    const response = await apiClient.patch(`/cases/${caseId}/responses/${responseId}`, updateData);
    return response.data;
  },
};

export default caseApi;
