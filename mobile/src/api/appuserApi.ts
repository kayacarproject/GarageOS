import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppUser {
  _id: string;
  id?: string;
  legalname?: string;
  name?: string;
  mobile?: string;
  email?: string;
  role: string;
  status?: 'active' | 'inactive' | 'deleted' | string;
  experience?: string;
  specialization?: string;
  address?: string;
  createdAt?: string;
}

export interface CreateAppUserPayload {
  legalname: string;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: string;
  roleId: string;
  roleName: string;
  provider: 'local';
  status: 'active';
  experience?: string;
  specialization?: string;
  address?: string;
}

export interface UpdateAppUserPayload {
  legalname?: string;
  name?: string;
  mobile?: string;
  email?: string;
  experience?: string;
  specialization?: string;
  address?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const appuserApi = {
  async getAll(
    role?: string,
    opts: { includeInactive?: boolean } = {},
  ): Promise<AppUser[]> {
    const query: Record<string, any> = {};
    if (role) query.role = role;
    if (!opts.includeInactive) query.status = 'active';

    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query,
      limit: 0,
      skip:  0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },

  async getById(id: string): Promise<AppUser | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query:      { _id: id },
      limit: 1,
      skip:  0,
    });
    const arr = Array.isArray(data?.data) ? data.data : [];
    return arr[0] ?? null;
  },

  async create(payload: CreateAppUserPayload): Promise<AppUser> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      body:       payload,
    });
    return data?.data ?? data;
  },

  async update(id: string, payload: UpdateAppUserPayload): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query:      { _id: id },
      body:       payload,
    });
  },

  async activate(id: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query:      { _id: id },
      body:       { status: 'active' },
    });
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query:      { _id: id },
      body:       { status: 'inactive' },
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'appuser',
      query:      { _id: id },
      body:       { status: 'deleted' },
    });
  },
};
