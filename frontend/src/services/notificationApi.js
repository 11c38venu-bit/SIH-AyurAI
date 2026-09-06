import apiClient from './apiClient';

export const notificationApi = {
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(notificationId) {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.post('/notifications/read-all');
    return response.data;
  },

  async createNotification(notificationData) {
    const response = await apiClient.post('/notifications/', notificationData);
    return response.data;
  },

  async cancelNotification(notificationId, cancellationReason = '') {
    const response = await apiClient.post(`/notifications/${notificationId}/cancel`, {
      cancellation_reason: cancellationReason,
    });
    return response.data;
  },

  async createReminder(reminderData) {
    const response = await apiClient.post('/notifications/reminders', reminderData);
    return response.data;
  },

  async getReminders(params = {}) {
    const response = await apiClient.get('/notifications/reminders', { params });
    return response.data;
  },

  async getPreferences() {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  async updatePreferences(preferencesData) {
    const response = await apiClient.patch('/notifications/preferences', preferencesData);
    return response.data;
  },
};

export default notificationApi;
