import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { StorageService } from '../services/storage';

// ─── Structured error ─────────────────────────────────────────────────────────

export class HanaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HanaApiError';
  }
}

function toHanaApiError(error: AxiosError): HanaApiError {
  const status  = error.response?.status ?? 0;
  const body    = error.response?.data as any;
  const code    = body?.code ?? 'UNKNOWN_ERROR';
  const message = body?.message ?? error.message ?? 'Something went wrong';
  return new HanaApiError(status, code, message);
}

// ─── Navigation ref (avoids importing navigation in non-component code) ───────

let _navigateToLogin: (() => void) | null = null;

export function setHanaNavigateToLogin(fn: () => void): void {
  _navigateToLogin = fn;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: 'https://api.hanaplatform.com',
  timeout: 12_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach Bearer token ────────────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (__DEV__) console.log(`[HanaAPI] → ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — normalize errors + handle 401 ────────────────────

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) console.log(`[HanaAPI] ← ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      await StorageService.clearAuth();
      _navigateToLogin?.();
    }

    if (__DEV__) {
      console.error(`[HanaAPI] ✗ ${status} ${error.config?.url}`, error.response?.data);
    }

    return Promise.reject(toHanaApiError(error));
  },
);

export default apiClient;
