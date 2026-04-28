import apiClient from './client';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HanaInvoiceItem {
  name: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  amount: number;
}

export interface HanaInvoice {
  _id: string;
  id?: string;
  jobcardId: string;
  estimateId?: string;
  invoiceNumber: string;
  items: HanaInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | string;
  createdAt?: string;
  createdBy?: string;
}

export interface CreateInvoicePayload {
  jobcardId: string;
  estimateId?: string;
  invoiceNumber: string;
  items: HanaInvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'unpaid';
  createdBy?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const invoiceApi = {
  async getByJobCard(jobcardId: string): Promise<HanaInvoice | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'invoice',
      query:      { jobcardId },
      limit:      1,
      skip:       0,
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list[0] ?? null;
  },

  async getById(id: string): Promise<HanaInvoice | null> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'invoice',
      query:      { _id: id },
      limit:      1,
      skip:       0,
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list[0] ?? null;
  },

  async create(payload: CreateInvoicePayload): Promise<HanaInvoice> {
    const { data } = await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'invoice',
      body:       payload,
    });
    return data?.data ?? data;
  },

  async recordPayment(id: string, update: {
    amountPaid: number;
    balanceDue: number;
    paymentStatus: string;
  }): Promise<void> {
    await apiClient.post('/api/v1/mongo/submitdata', {
      appName:    APP_NAME,
      moduleName: 'invoice',
      query:      { _id: id },
      body:       update,
    });
  },

  generateInvoiceNumber(): string {
    const now = new Date();
    const seq = now.getTime().toString().slice(-5);
    return `INV${now.getFullYear()}${seq}`;
  },
};
