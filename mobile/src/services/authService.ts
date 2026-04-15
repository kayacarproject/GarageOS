import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import env from '../config/env';
import { dummyUsers, dummyCompany, DEV_LOGIN_MAP } from '../dummy/users';
import type { User, Company } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export interface LoginResult {
  token: string;
  user: User;
  company: Company;
}

export const authService = {

  /** POST /auth/login */
  async login(identifier: string, password: string): Promise<LoginResult> {
    if (env.USE_DUMMY_DATA) {
      const devKey = identifier.toLowerCase() as keyof typeof DEV_LOGIN_MAP;
      if (DEV_LOGIN_MAP[devKey]) {
        const user = DEV_LOGIN_MAP[devKey];
        const result: LoginResult = {
          token: `dev-token-${user.role.toLowerCase()}`,
          user,
          company: dummyCompany,
        };
        await AsyncStorage.multiSet([[TOKEN_KEY, result.token], [USER_KEY, JSON.stringify(user)]]);
        return result;
      }
      const user = dummyUsers.find(
        (u) => (u.email === identifier || u.mobile === identifier) && u.password === password,
      );
      if (!user) throw new Error('Invalid credentials');
      const result: LoginResult = { token: 'dummy-jwt-token', user, company: dummyCompany };
      await AsyncStorage.multiSet([[TOKEN_KEY, result.token], [USER_KEY, JSON.stringify(user)]]);
      return result;
    }

    const { data } = await api.post<LoginResult>('/auth/login', { identifier, password });
    await AsyncStorage.multiSet([[TOKEN_KEY, data.token], [USER_KEY, JSON.stringify(data.user)]]);
    return data;
  },

  /** POST /auth/refresh */
  async refreshToken(): Promise<string> {
    if (env.USE_DUMMY_DATA) {
      const token = (await AsyncStorage.getItem(TOKEN_KEY)) ?? 'dummy-jwt-token';
      return token;
    }
    const { data } = await api.post<{ token: string }>('/auth/refresh');
    await AsyncStorage.setItem(TOKEN_KEY, data.token);
    return data.token;
  },

  /** POST /auth/logout */
  async logout(): Promise<void> {
    if (!env.USE_DUMMY_DATA) {
      await api.post('/auth/logout').catch(() => {});
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  /** GET /auth/me */
  async getCurrentUser(): Promise<{ user: User; company: Company }> {
    if (env.USE_DUMMY_DATA) {
      const raw = await AsyncStorage.getItem(USER_KEY);
      const user = raw ? JSON.parse(raw) : dummyUsers[0];
      return { user, company: dummyCompany };
    }
    const { data } = await api.get<{ user: User; company: Company }>('/auth/me');
    return data;
  },

  /** Validates a stored token — used on app launch */
  async validateToken(token: string): Promise<{ user: User; company: Company }> {
    if (env.USE_DUMMY_DATA) {
      const role = token.replace('dev-token-', '').toUpperCase();
      const user = dummyUsers.find((u) => u.role === role) ?? dummyUsers[0];
      return { user, company: dummyCompany };
    }
    const { data } = await api.get<{ user: User; company: Company }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (env.USE_DUMMY_DATA) return { message: 'Reset link sent to your email' };
    const { data } = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
};
