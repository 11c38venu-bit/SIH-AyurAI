import apiClient from './apiClient';

export const queueApi = {
  async getTodayQueue(statusFilter = null) {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    const response = await apiClient.get('/queue/today', { params });
    return response.data;
  },

  async createToken(patientId, priority = 'NORMAL', queueDate = null) {
    const payload = {
      patient_id: Number(patientId),
      priority: priority.toUpperCase(),
      queue_date: queueDate,
    };
    const response = await apiClient.post('/queue/token', payload);
    return response.data;
  },

  async getPatientQueue(patientId) {
    const response = await apiClient.get(`/queue/patient/${patientId}`);
    return response.data;
  },

  async updateTokenStatus(queueId, status) {
    const response = await apiClient.patch(`/queue/${queueId}/status`, {
      status: status.toUpperCase(),
    });
    return response.data;
  },

  async updateTokenPriority(queueId, priority) {
    const response = await apiClient.patch(`/queue/${queueId}/priority`, {
      priority: priority.toUpperCase(),
    });
    return response.data;
  },
};

export default queueApi;
