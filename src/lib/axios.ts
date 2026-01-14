import axios from 'axios';
import i18n from './i18n';

const DEFAULT_API_URL = 'http://localhost:5000';

let apiUrl = DEFAULT_API_URL;

const loadConfig = async (): Promise<string> => {
  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      const config = await response.json();
      if (config.apiUrl) {
        return config.apiUrl;
      }
    }
  } catch (error) {
    console.warn('Failed to load config.json, using default API URL:', error);
  }
  return DEFAULT_API_URL;
};

const initApi = async (): Promise<void> => {
  apiUrl = await loadConfig();
  api.defaults.baseURL = apiUrl;
};

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

initApi();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Language'] = i18n.language || 'tr';
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      
      try {
        const { useAuthStore } = await import('@/stores/auth-store');
        useAuthStore.getState().logout();
      } catch (err) {
        console.warn('Failed to clear auth store:', err);
      }
      
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login?sessionExpired=true';
      }
    }

    const apiError = error.response?.data;
    if (apiError?.message) {
      error.message = apiError.message;
    } else if (apiError?.exceptionMessage) {
      error.message = apiError.exceptionMessage;
    }

    return Promise.reject(error);
  }
);

declare module 'axios' {
  export interface AxiosInstance {
    get<T = unknown>(url: string, config?: any): Promise<T>;
    post<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
    put<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
    delete<T = unknown>(url: string, config?: any): Promise<T>;
    patch<T = unknown>(url: string, data?: any, config?: any): Promise<T>;
  }
}