import apiClient from './client';
import type { HanaLoginResponse } from '../types/auth.types';

const APP_NAME = 'garageosapp.hanaplatform.com';

export const authApi = {
  /**
   * POST /api/v1/auth/login
   * Sends appName + identifier + password, returns access/refresh tokens and user.
   */
  async login(identifier: string, password: string): Promise<HanaLoginResponse> {
    const { data } = await apiClient.post<HanaLoginResponse>('/api/v1/auth/login', {
      appName: APP_NAME,
      identifier,
      password,
    });
    return data;
  },
};
