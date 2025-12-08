import axios from 'axios';

// Create an axios instance
const apiClient = axios.create({
  // Use environment variable for production, fallback to proxy for dev
  baseURL: (process.env.REACT_APP_API_URL || '') + '/api',
});

// Add a request interceptor to include the token in every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Debug log outgoing request
    try {
      console.log('[apiClient] Request', {
        method: config.method,
        url: `${config.baseURL || ''}${config.url}`,
        data: config.data
      });
    } catch (_) { }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response logging
apiClient.interceptors.response.use(
  (response) => {
    try {
      console.log('[apiClient] Response', {
        url: response.config?.url,
        status: response.status,
        data: response.data
      });
    } catch (_) { }
    return response;
  },
  (error) => {
    try {
      console.warn('[apiClient] Error', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } catch (_) { }
    return Promise.reject(error);
  }
);

export default apiClient;