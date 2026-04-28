import api from './api';
import env from '../config/env';
import { authApi } from '../api/authApi';
import { StorageService } from './storage';
import { mapApiRole } from '../navigation/roleRouter';
import { dummyUsers, dummyCompany } from '../dummy/users';
import type { User, Company } from '../types';

// ─── Result type ──────────────────────────────────────────────────────────────

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: User;
  company: Company | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {

  /**
   * POST /api/v1/auth/login
   *
   * Always calls the real Hana Platform API — never uses dummy data.
   * Other services respect USE_DUMMY_DATA for their own mocking, but auth
   * must always go to the real backend so user identity is genuine.
   */
  async login(identifier: string, password: string): Promise<LoginResult> {
    const response = await authApi.login(identifier, password);
    const { access_token, refresh_token, user: hanaUser } = response.data;

    const legalname = hanaUser.legalname?.trim() || hanaUser.name;

      const user: User = {
        id:        hanaUser.id,
        name:      legalname,
        legalname,
        mobile:    hanaUser.mobile,
        email:     hanaUser.email,
        role:      mapApiRole(hanaUser.roleData?.role ?? hanaUser.role ?? 'mechanic'),
        is_active: true,
        created_at: new Date().toISOString(),
      };

    await StorageService.setAuthData(access_token, refresh_token, user);

    return { token: access_token, refreshToken: refresh_token, user, company: null };
  },

  /** Clear all stored auth data and fire server logout if available */
  async logout(): Promise<void> {
    if (!env.USE_DUMMY_DATA) {
      await api.post('/auth/logout').catch(() => {});
    }
    await StorageService.clearAuth();
  },

  /** GET /auth/me — re-validate token and fetch fresh user data */
  async getCurrentUser(): Promise<{ user: User; company: Company | null }> {
    if (env.USE_DUMMY_DATA) {
      const user = (await StorageService.getUser()) ?? dummyUsers[0];
      return { user, company: dummyCompany };
    }
    const { data } = await api.get<{ user: User; company: Company }>('/auth/me');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (env.USE_DUMMY_DATA) return { message: 'Reset link sent to your email' };
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async getStoredToken(): Promise<string | null> {
    return StorageService.getAccessToken();
  },
};
