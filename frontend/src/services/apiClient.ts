/**
 * UniSwap SA — Central Axios API Client
 * Configured with JWT lifecycle, token rotation, and error normalization.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Storage keys
export const TOKEN_STORAGE_KEY = 'uniswap_access_token';
export const REFRESH_STORAGE_KEY = 'uniswap_refresh_token';
export const USER_STORAGE_KEY = 'uniswap_cached_user';

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_STORAGE_KEY);
}

export function storeTokens(access: string, refresh?: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, access);
  if (refresh) {
    localStorage.setItem(REFRESH_STORAGE_KEY, refresh);
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Automatic Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getStoredRefreshToken();

      // If no refresh token or already refreshing failed
      if (!refreshToken || originalRequest.url?.includes('/api/accounts/login/')) {
        clearStoredAuth();
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
        const refreshResponse = await axios.post(`${API_BASE}/api/accounts/login/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = refreshResponse.data.access;
        storeTokens(newAccessToken);
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredAuth();
        window.dispatchEvent(new Event('uniswap:auth_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Normalizes DRF errors into readable string for UI notifications
 */
export function extractErrorMessage(error: unknown, defaultMsg = 'An unexpected error occurred.'): string {
  if (error && typeof error === 'object') {
    const err = error as any;
    const data = err.response?.data || err.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        if ('detail' in data && typeof data.detail === 'string') return data.detail;
        if ('error' in data && typeof data.error === 'string') return data.error;
        if ('message' in data && typeof data.message === 'string') return data.message;

        // Validation field errors: e.g. { email: ["Invalid email"], price: ["Required"] }
        const fieldErrors = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : String(val)}`)
          .join(' | ');
        if (fieldErrors) return fieldErrors;
      }
    }
    if (err.message && typeof err.message === 'string') return err.message;
  }
  return defaultMsg;
}
