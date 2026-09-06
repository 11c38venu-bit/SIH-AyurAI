import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('ayurai_access_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Failed to read access token from storage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors, 401 Unauthorized, 403 Forbidden
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Clear invalid auth token
        try {
          localStorage.removeItem('ayurai_access_token');
          localStorage.removeItem('ayurai_user');
          window.dispatchEvent(new CustomEvent('ayurai:auth-expired'));
        } catch (e) {
          console.warn('Failed to clear expired auth state', e);
        }
      }

      // Format human-friendly error details
      let message = 'An unexpected error occurred. Please try again.';
      if (data) {
        if (typeof data.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Pydantic validation error array
          message = data.detail.map((err) => err.msg || err.message || JSON.stringify(err)).join(', ');
        } else if (data.message) {
          message = data.message;
        }
      }
      error.userMessage = message;
    } else if (error.request) {
      error.userMessage = 'Unable to connect to AYURAI server. Please check your network or ensure backend is running.';
    } else {
      error.userMessage = error.message || 'An unexpected request error occurred.';
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error, defaultMsg = 'Operation failed. Please try again.') => {
  if (!error) return defaultMsg;
  if (error.userMessage) return error.userMessage;
  if (error.response?.data?.detail) {
    if (typeof error.response.data.detail === 'string') return error.response.data.detail;
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map((e) => e.msg || JSON.stringify(e)).join(', ');
    }
  }
  return error.message || defaultMsg;
};

export default apiClient;
