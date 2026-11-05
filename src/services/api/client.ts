import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://31.57.77.199:5055';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('otelsaas_token') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Silent Refresh Token & Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      const refreshToken = localStorage.getItem('otelsaas_refresh_token');

      if (!refreshToken) {
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('otelsaas_token');
          localStorage.removeItem('token');
          localStorage.removeItem('otelsaas_refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const data = response.data?.data;
        if (data?.accessToken) {
          localStorage.setItem('otelsaas_token', data.accessToken);
          localStorage.setItem('token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('otelsaas_refresh_token', data.refreshToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }
          processQueue(null, data.accessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token invalid');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('otelsaas_token');
        localStorage.removeItem('token');
        localStorage.removeItem('otelsaas_refresh_token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  errorCode?: string | null;
  errors?: Record<string, string[]> | null;
}
