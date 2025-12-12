import axios from 'axios';
import { getToken } from '../utils/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
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
      console.warn("Unauthorized: Login again.");
    }
    return Promise.reject(error);
  }
);

export default instance;
