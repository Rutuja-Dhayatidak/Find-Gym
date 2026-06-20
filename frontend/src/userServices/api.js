import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to dynamically attach the correct token
api.interceptors.request.use(
  (config) => {
    let token = null;
    const url = config.url || '';

    if (url.startsWith('/trainer') || url.includes('/trainer')) {
      token = localStorage.getItem('trainerToken');
    } else if (url.startsWith('/gym-owner') || url.includes('/gym-owner') || url.startsWith('/gyms') || url.includes('/gyms')) {
      token = localStorage.getItem('gymOwnerToken');
    } else {
      token = localStorage.getItem('userToken');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred';
    if (error.response && error.response.data) {
      if (error.response.data.error) {
        message = error.response.data.error;
      } else if (error.response.data.details && error.response.data.details.length > 0) {
        message = error.response.data.details[0].msg || error.response.data.details[0].message || message;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    } else {
      message = error.message;
    }
    throw new Error(message);
  }
);

export default api;
