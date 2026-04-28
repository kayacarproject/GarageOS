import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HanaPayment {
  _id: string;
  invoiceId: string;
  jobcardId: string;
  amount: number;
  mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | string;
  reference?: string;
  purpose: 'full' | 'partial' | 'balance' | string;
  collectedBy?: string;
  collectedAt: string;
}

export interface CreatePaymentPayload {
  invoiceId: string;
  jobcardId: string;
  amount: number;
  mode: string;
  reference?: string;
  purpose: string;
  collectedBy?: string;
  collectedAt: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const paymentApi = {
  async create(payload: CreatePaymentPayload): Promise<HanaPayment> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'payment',
      body:       payload,
    });
    return data?.data ?? data;
  },

  async getByInvoice(invoiceId: string): Promise<HanaPayment[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'payment',
      query:      { invoiceId },
      limit:      0,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },
};
