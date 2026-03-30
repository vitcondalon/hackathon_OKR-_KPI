import axios from 'axios';
import { clearToken, getToken } from '../lib/authStorage';

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw || typeof raw !== 'string') {
    return '/api';
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return '/api';
  }
  return trimmed.replace(/\/+$/, '');
}

const axiosClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000
});

axiosClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
