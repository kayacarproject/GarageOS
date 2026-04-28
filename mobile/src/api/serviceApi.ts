import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HanaService {
  _id: string;
  id?: string;
  name: string;
  code: string;        // 'service' | 'repair' | 'service_repair'
  price: number;
  taxPercent: number;  // e.g. 18 for 18%
  active: boolean;
  description?: string;
  createdAt?: string;
}

export interface CreateServicePayload {
  name: string;
  code: string;
  price: number;
  taxPercent: number;
  active: boolean;
  description?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const serviceApi = {
  async getAll(activeOnly = false): Promise<HanaService[]> {
    const query: Record<string, any> = {};
    if (activeOnly) query.active = true;

    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'service_master',
      query,
      limit:      0,
      skip:       0,
    });
    const docs: any[] = Array.isArray(data?.data) ? data.data : [];
    // Filter out soft-deleted docs and normalize numeric fields
    return docs
      .filter(d => !d.deleted)
      .map(d => ({
        ...d,
        price:      Number(d.price)      || 0,
        taxPercent: Number(d.taxPercent) || 0,
        active:     d.active !== false,
      }));
  },

  async getByCode(code: string): Promise<HanaService | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'service_master',
      query:      { code, active: true },
      limit:      1,
      skip:       0,
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list[0] ?? null;
  },

  async create(payload: CreateServicePayload): Promise<HanaService> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'service_master',
      body:       payload,
    });
    return data?.data ?? data;
  },

  async update(id: string, payload: Partial<CreateServicePayload>): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'service_master',
      query:      { _id: id },
      body:       payload,
    });
  },

  async delete(id: string): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'service_master',
      query:      { _id: id },
      body:       { active: false, deleted: true },
    });
  },

  // Seed default services if the collection is empty
  async seedDefaults(): Promise<void> {
    const existing = await serviceApi.getAll();
    if (existing.length > 0) return;

    const defaults: CreateServicePayload[] = [
      { name: 'Service',          code: 'service',         price: 1500, taxPercent: 18, active: true, description: 'Routine maintenance & oil change' },
      { name: 'Repair',           code: 'repair',          price: 2500, taxPercent: 18, active: true, description: 'Fix specific issues or damage' },
      { name: 'Service + Repair', code: 'service_repair',  price: 3500, taxPercent: 18, active: true, description: 'Full service with repairs included' },
    ];

    await Promise.all(defaults.map(d => serviceApi.create(d)));
  },

  // Helper — compute tax and total from a service record
  calcPricing(service: HanaService): { basePrice: number; taxPercent: number; taxAmount: number; estimatedTotal: number } {
    const basePrice  = Number(service.price)      || 0;
    const taxPercent = Number(service.taxPercent) || 0;
    const taxAmount  = Math.round((basePrice * taxPercent) / 100);
    return { basePrice, taxPercent, taxAmount, estimatedTotal: basePrice + taxAmount };
  },
};
