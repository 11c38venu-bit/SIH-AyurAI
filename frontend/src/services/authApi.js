import apiClient from './apiClient';

export const authApi = {
  async login(username, password) {
    const response = await apiClient.post('/auth/login/json', {
      username,
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authApi;
