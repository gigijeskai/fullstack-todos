import axios from 'axios';

// Use environment variable with a fallback to local development URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create an axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;