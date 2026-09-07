import apiClient from './apiClient';

export const adminApi = {
  async getUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  async getUser(userId) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  async createUser(userData) {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  async updateUser(userId, userData) {
    const response = await apiClient.patch(`/admin/users/${userId}`, userData);
    return response.data;
  },

  async updateUserRole(userId, newRole, justification = null) {
    const response = await apiClient.patch(`/admin/users/${userId}/role`, {
      new_role: newRole,
      justification,
    });
    return response.data;
  },

  async activateUser(userId) {
    const response = await apiClient.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },

  async deactivateUser(userId) {
    const response = await apiClient.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  async resetPassword(userId, newPassword) {
    const response = await apiClient.post(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  async getDoctors(isActive = null) {
    const params = {};
    if (isActive !== null) params.is_active = isActive;
    const response = await apiClient.get('/admin/doctors', { params });
    return response.data;
  },

  async getStaff(isActive = null) {
    const params = {};
    if (isActive !== null) params.is_active = isActive;
    const response = await apiClient.get('/admin/staff', { params });
    return response.data;
  },

  async getUserStatistics() {
    const response = await apiClient.get('/admin/users/statistics');
    return response.data;
  },

  async getAdminDashboard() {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  async getAudits(params = {}) {
    const response = await apiClient.get('/admin/audits', { params });
    return response.data;
  },
};

export default adminApi;
