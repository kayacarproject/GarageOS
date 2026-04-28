import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { StorageService } from './storage';
import env from '../config/env';

// ─── Navigation ref (set from AppNavigator on mount) ─────────────────────────
// Avoids importing navigation inside a non-component file.

let _navigateToLogin: (() => void) | null = null;

export function setNavigateToLogin(fn: () => void) {
  _navigateToLogin = fn;
}

// ─── Structured API Error ─────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function toApiError(error: AxiosError): ApiError {
  const status  = error.response?.status ?? 0;
  const body    = error.response?.data as any;
  const code    = body?.code ?? body?.error ?? 'UNKNOWN_ERROR';
  const message = body?.message ?? error.message ?? 'An unexpected error occurred';
  return new ApiError(status, code, message, body?.details);
}

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (__DEV__) {
      console.log(`[API] → ${config.method?.toUpperCase()} ${config.url}`, config.params ?? '');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;
const RETRYABLE_CODES = new Set([408, 429, 502, 503, 504]);

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`[API] ← ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    const status = error.response?.status;

    // ── 401: clear token + redirect to login ──────────────────────────────────
    if (status === 401) {
      await StorageService.clearAuth();
      _navigateToLogin?.();
      return Promise.reject(toApiError(error));
    }

    // ── Retry on transient errors ─────────────────────────────────────────────
    if (config && RETRYABLE_CODES.has(status ?? 0)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      if (config._retryCount <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * config._retryCount!));
        if (__DEV__) console.warn(`[API] Retry ${config._retryCount}/${MAX_RETRIES} → ${config.url}`);
        return api(config);
      }
    }

    if (__DEV__) {
      console.error(`[API] ✗ ${status} ${error.config?.url}`, error.response?.data);
    }

    return Promise.reject(toApiError(error));
  },
);

// ─── Cancellation helper ──────────────────────────────────────────────────────

/**
 * Creates an AbortController and returns { signal, cancel }.
 * Pass signal into any api call via config: api.get(url, { signal })
 *
 * @example
 * const { signal, cancel } = makeCancelToken();
 * useEffect(() => () => cancel(), []);
 * const data = await api.get('/customers', { signal });
 */
export function makeCancelToken() {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
  };
}

export default api;

/*
 * ─── API Versioning Strategy ──────────────────────────────────────────────────
 *
 * Current: /api/v1 (set in env.ts → API_BASE_URL)
 *
 * When v2 is needed:
 *   1. Add API_BASE_URL_V2 to env.ts
 *   2. Create apiV2 = axios.create({ baseURL: env.API_BASE_URL_V2 })
 *      — reuse the same interceptors via a factory function
 *   3. Import apiV2 only in services that need v2 endpoints
 *   4. Never mix v1/v2 in the same service call
 *
 * ─── Caching Strategy (React Query / SWR) ────────────────────────────────────
 *
 * Recommended: @tanstack/react-query
 *
 *   const { data: customers } = useQuery({
 *     queryKey: ['customers', search],
 *     queryFn: () => customerService.getAll(search),
 *     staleTime: 60_000,          // 1 min — don't refetch if fresh
 *     gcTime: 5 * 60_000,         // 5 min — keep in cache after unmount
 *   });
 *
 *   // Invalidate after mutation:
 *   queryClient.invalidateQueries({ queryKey: ['customers'] });
 *
 * Benefits over manual state:
 *   - Automatic background refetch on window focus
 *   - Deduplication of concurrent identical requests
 *   - Optimistic updates with rollback
 *   - Offline support with persistQueryClient
 */
