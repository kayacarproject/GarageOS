import api from './api';
import env from '../config/env';
import { dummyVehicles } from '../dummy/vehicles';
import { dummyCustomers } from '../dummy/customers';
import type { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from '../types';

export const vehicleService = {
  async getAll(filters?: { customerId?: string; last4?: string }): Promise<Vehicle[]> {
    if (env.USE_DUMMY_DATA) {
      let list = [...dummyVehicles];
      if (filters?.customerId) {
        list = list.filter(
          (v) => v.customer_id === filters.customerId || v.customerId === filters.customerId,
        );
      }
      if (filters?.last4) {
        list = list.filter((v) => v.registration_number.slice(-4) === filters.last4);
      }
      return list;
    }
    const { data } = await api.get<Vehicle[]>('/vehicles', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Vehicle> {
    if (env.USE_DUMMY_DATA) {
      const v = dummyVehicles.find((v) => v.id === id);
      if (!v) throw new Error(`Vehicle not found: ${id}`);
      return v;
    }
    const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
    return data;
  },

  async create(payload: CreateVehiclePayload): Promise<Vehicle> {
    if (env.USE_DUMMY_DATA) {
      const customer = dummyCustomers.find((c) => c.id === payload.customer_id);
      const newV: Vehicle = {
        ...payload,
        id: `v-${Date.now()}`,
        company_id: 'c1',
        companyId: 'c1',
        customerId: payload.customer_id,
        licensePlate: payload.registration_number,
        make: payload.brand,
        mileage: payload.current_kms,
        created_at: new Date().toISOString(),
        customer: customer
          ? { id: customer.id, name: customer.name, mobile: customer.mobile }
          : undefined,
      };
      dummyVehicles.push(newV);
      return newV;
    }
    const { data } = await api.post<Vehicle>('/vehicles', payload);
    return data;
  },

  async update(id: string, payload: UpdateVehiclePayload): Promise<Vehicle> {
    if (env.USE_DUMMY_DATA) {
      const idx = dummyVehicles.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error(`Vehicle not found: ${id}`);
      dummyVehicles[idx] = {
        ...dummyVehicles[idx],
        ...payload,
        // keep legacy aliases in sync
        ...(payload.brand ? { make: payload.brand } : {}),
        ...(payload.registration_number ? { licensePlate: payload.registration_number } : {}),
        ...(payload.current_kms !== undefined ? { mileage: payload.current_kms } : {}),
      };
      return dummyVehicles[idx];
    }
    const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload);
    return data;
  },
};
