import React, { createContext, useContext, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { StorageService } from '../services/storage';
import { showToast } from '../utils/toast';
import type { User } from '../types';

// ─── Context value ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Error message mapping ────────────────────────────────────────────────────

function resolveErrorMessage(error: unknown): string {
  const e = error as any;

  if (e?.status === 401 || e?.code === 'INVALID_CREDENTIALS') {
    return 'Invalid identifier or password';
  }
  if (
    e?.code === 'ECONNABORTED' ||
    e?.message?.toLowerCase().includes('network') ||
    e?.message?.toLowerCase().includes('timeout') ||
    e?.status === 0
  ) {
    return 'Please check internet connection';
  }
  if (!e?.status || e?.status >= 500) {
    return 'Something went wrong. Please try again later';
  }
  return e?.message ?? 'An unexpected error occurred';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAuthStore();

  const login = useCallback(async (identifier: string, password: string): Promise<void> => {
    store.setLoading(true);
    store.setError(null);
    try {
      const result = await authService.login(identifier, password);
      store.login(result.user, result.company, result.token, result.refreshToken);
      showToast('Login successful', 'success');
    } catch (error) {
      const msg = resolveErrorMessage(error);
      store.setError(msg);
      showToast(msg, 'error');
      throw new Error(msg); // rethrow with user-friendly message for callers
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    await StorageService.clearAuth();
    store.logout();
  }, [store]);

  return (
    <AuthContext.Provider
      value={{
        user:            store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading:       store.isLoading,
        error:           store.error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
