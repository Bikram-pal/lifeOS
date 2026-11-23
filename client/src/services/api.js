import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token is stored in localStorage as fallback
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifeos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling 401 unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and fire custom event or redirect if needed
      localStorage.removeItem('lifeos_token');
      localStorage.removeItem('lifeos_user');
    }
    return Promise.reject(error);
  }
);

export default api;
