import axios from 'axios';
import config from '../config/config';

const api = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

export default api;

// This utils it serves: centralized configutations without repeating code, and also interceptors to handle the token and redirect to login page when the token is invalid.
// Automated token handling: when the token is invalid, the user is redirected to the login page.
// The token is stored in the localStorage, and it is sent in the Authorization header of the requests.
