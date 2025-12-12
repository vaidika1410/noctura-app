import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

const instance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});


instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);


instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
  
      console.warn('Unauthorized request - check login.');
    }
  
    return Promise.reject(error);
  }
);

export default instance;
