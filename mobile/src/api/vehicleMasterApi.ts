import apiClient from './client';
import { VEHICLE_BRANDS, BrandEntry } from '../constants/vehicleMaster';

const APP_NAME = 'garageosapp.hanaplatform.com';

export const vehicleMasterApi = {
  async getBrands(): Promise<string[]> {
    try {
      const { data } = await apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME,
        moduleName: 'vehicle_master',
        query: { type: 'brand' },
        limit: 0,
        skip: 0,
      });
      const rows: any[] = Array.isArray(data?.data) ? data.data : [];
      if (rows.length > 0) {
        return rows.map((r: any) => r.name ?? r.brand ?? '').filter(Boolean);
      }
    } catch {
      // fall through to local data
    }
    return VEHICLE_BRANDS.map(b => b.name);
  },

  async getModels(brand: string): Promise<string[]> {
    try {
      const { data } = await apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME,
        moduleName: 'vehicle_master',
        query: { type: 'model', brand },
        limit: 0,
        skip: 0,
      });
      const rows: any[] = Array.isArray(data?.data) ? data.data : [];
      if (rows.length > 0) {
        return rows.map((r: any) => r.name ?? r.model ?? '').filter(Boolean);
      }
    } catch {
      // fall through to local data
    }
    return VEHICLE_BRANDS.find(b => b.name === brand)?.models ?? [];
  },

  getBrandsLocal(): BrandEntry[] {
    return VEHICLE_BRANDS;
  },
};
