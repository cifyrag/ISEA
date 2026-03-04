import axios, { type AxiosResponse } from 'axios';
import { logError } from '../errorLogger';

const API_BASE_URL = 'http://localhost:5112';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('sessionExpired', 'true');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function apiCall<T>(request: () => Promise<AxiosResponse<T>>): Promise<Result<T>> {
  try {
    const response = await request();
    return { ok: true, data: response.data };
  } catch (err: any) {
    const message = err.response?.data?.Error
      || err.response?.data?.message
      || err.response?.data
      || err.message
      || 'unknown_error';
    const errorStr = typeof message === 'string' ? message : JSON.stringify(message);
    if (err.response?.status !== 401) {
      logError(`API error: ${errorStr}`, err.stack);
    }
    return { ok: false, error: errorStr };
  }
}

export default api;
