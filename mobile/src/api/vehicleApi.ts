import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// Shape returned by the Hana MongoDB gateway
export interface HanaVehicle {
  _id: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  currentKM?: string;
  fuleType?: string; // API typo — must match exactly
  customerId?: string;
  createdAt?: string;
}

export interface AddVehiclePayload {
  registrationNumber: string;
  brand: string;
  model: string;
  year?: string;
  color?: string;
  currentKM?: string;
  fuleType?: string; // API typo — must match exactly
  customerId?: string;
}

export const vehicleApi = {
  async addVehicle(payload: AddVehiclePayload): Promise<HanaVehicle> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName: APP_NAME,
      moduleName: 'vehicle',
      body: payload,
    });
    return data?.data ?? data;
  },

  async getVehicles(query: Record<string, any> = {}): Promise<HanaVehicle[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName: APP_NAME,
      moduleName: 'vehicle',
      query,
      limit: 0,
      skip: 0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },
};
