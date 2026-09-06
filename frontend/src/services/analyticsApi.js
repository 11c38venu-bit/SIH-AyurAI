import apiClient from './apiClient';

export const analyticsApi = {
  async getDoctorDashboard() {
    const response = await apiClient.get('/analytics/doctor/dashboard');
    return response.data;
  },

  async getStaffDashboard() {
    const response = await apiClient.get('/analytics/staff/dashboard');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await apiClient.get('/analytics/admin/dashboard');
    return response.data;
  },

  async getDashboardSummary() {
    const response = await apiClient.get('/analytics/dashboard/summary');
    return response.data;
  },

  async getPatientsOverview(params = {}) {
    const response = await apiClient.get('/analytics/patients/overview', { params });
    return response.data;
  },

  async getPatientsTrend(params = {}) {
    const response = await apiClient.get('/analytics/patients/trend', { params });
    return response.data;
  },

  async getQueueOverview(params = {}) {
    const response = await apiClient.get('/analytics/queue/overview', { params });
    return response.data;
  },

  async getQueueTrend(params = {}) {
    const response = await apiClient.get('/analytics/queue/trend', { params });
    return response.data;
  },

  async getConsultationsOverview(params = {}) {
    const response = await apiClient.get('/analytics/consultations/overview', { params });
    return response.data;
  },

  async getConsultationsTrend(params = {}) {
    const response = await apiClient.get('/analytics/consultations/trend', { params });
    return response.data;
  },

  async getDoctorsWorkload(params = {}) {
    const response = await apiClient.get('/analytics/doctors/workload', { params });
    return response.data;
  },

  async getFollowUpsOverview(params = {}) {
    const response = await apiClient.get('/analytics/follow-ups/overview', { params });
    return response.data;
  },

  async getFollowUpsTrend(params = {}) {
    const response = await apiClient.get('/analytics/follow-ups/trend', { params });
    return response.data;
  },

  async getProgressOverview(params = {}) {
    const response = await apiClient.get('/analytics/progress/overview', { params });
    return response.data;
  },

  async getProgressTrend(params = {}) {
    const response = await apiClient.get('/analytics/progress/trend', { params });
    return response.data;
  },

  async getPrescriptionsOverview(params = {}) {
    const response = await apiClient.get('/analytics/prescriptions/overview', { params });
    return response.data;
  },

  async getPrescriptionsCategories(params = {}) {
    const response = await apiClient.get('/analytics/prescriptions/categories', { params });
    return response.data;
  },

  async getDocumentsOverview(params = {}) {
    const response = await apiClient.get('/analytics/documents/overview', { params });
    return response.data;
  },

  async getAiOverview(params = {}) {
    const response = await apiClient.get('/analytics/ai/overview', { params });
    return response.data;
  },

  async getAiTrend(params = {}) {
    const response = await apiClient.get('/analytics/ai/trend', { params });
    return response.data;
  },

  async getNotificationsOverview(params = {}) {
    const response = await apiClient.get('/analytics/notifications/overview', { params });
    return response.data;
  },

  async getSystemOverview() {
    const response = await apiClient.get('/analytics/system/overview');
    return response.data;
  },

  async getExportSummary(params = {}) {
    const response = await apiClient.get('/analytics/export/summary', { params });
    return response.data;
  },
};

export default analyticsApi;
