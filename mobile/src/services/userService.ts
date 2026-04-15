import api from './api';
import env from '../config/env';
import { dummyUsers } from '../dummy/users';
import type { User, UserRole } from '../types';

export interface CreateUserPayload {
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  email?: string;
  role?: UserRole;
}

export const userService = {

  /** GET /users — owner/superadmin only */
  async getAll(): Promise<User[]> {
    if (env.USE_DUMMY_DATA) {
      return dummyUsers.map(({ password: _pw, ...u }) => u);
    }
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  async getById(id: string): Promise<User> {
    if (env.USE_DUMMY_DATA) {
      const u = dummyUsers.find((u) => u.id === id);
      if (!u) throw new Error(`User not found: ${id}`);
      const { password: _pw, ...user } = u;
      return user;
    }
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  /** POST /users */
  async create(payload: CreateUserPayload): Promise<User> {
    if (env.USE_DUMMY_DATA) {
      const now = new Date().toISOString();
      const newUser = {
        id: `u-${Date.now()}`,
        company_id: 'c1',
        companyId: 'c1',
        name: payload.name,
        mobile: payload.mobile,
        email: payload.email,
        role: payload.role,
        is_active: true,
        created_at: now,
        password: payload.password,
      };
      dummyUsers.push(newUser as any);
      const { password: _pw, ...user } = newUser;
      return user as User;
    }
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  /** PUT /users/:id */
  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyUsers.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error(`User not found: ${id}`);
      dummyUsers[idx] = { ...dummyUsers[idx], ...payload };
      const { password: _pw, ...user } = dummyUsers[idx];
      return user as User;
    }
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },

  /** PUT /users/:id/deactivate */
  async deactivate(id: string): Promise<User> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyUsers.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error(`User not found: ${id}`);
      dummyUsers[idx] = { ...dummyUsers[idx], is_active: false };
      const { password: _pw, ...user } = dummyUsers[idx];
      return user as User;
    }
    const { data } = await api.put<User>(`/users/${id}/deactivate`);
    return data;
  },
};
