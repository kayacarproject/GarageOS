import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'ACCESS_TOKEN',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  USER_DATA:     'USER_DATA',
} as const;

export const StorageService = {
  async setAuthData(accessToken: string, refreshToken: string, user: User): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN,  accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      [STORAGE_KEYS.USER_DATA,     JSON.stringify(user)],
    ]);
  },

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!raw) return null;
    try { return JSON.parse(raw) as User; } catch { return null; }
  },

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  },
};
