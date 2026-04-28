import apiClient from './client';
import type { HanaPayment } from './paymentApi';
import type { HanaInvoice } from './invoiceApi';
import type { HanaJobCard } from './jobcardApi';

const APP_NAME = 'garageosapp.hanaplatform.com';

export interface RevenueRawData {
  payments: HanaPayment[];
  invoices: HanaInvoice[];
  jobcards: HanaJobCard[];
}

export const revenueApi = {
  /** Fetch all three collections in parallel — filter/aggregate client-side. */
  async fetchAll(): Promise<RevenueRawData> {
    const [pmtRes, invRes, jcRes] = await Promise.all([
      apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME, moduleName: 'payment', query: {}, limit: 0, skip: 0,
      }),
      apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME, moduleName: 'invoice', query: {}, limit: 0, skip: 0,
      }),
      apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME, moduleName: 'jobcard', query: {}, limit: 0, skip: 0,
      }),
    ]);

    return {
      payments: Array.isArray(pmtRes.data?.data) ? pmtRes.data.data : [],
      invoices: Array.isArray(invRes.data?.data) ? invRes.data.data : [],
      jobcards: Array.isArray(jcRes.data?.data)  ? jcRes.data.data  : [],
    };
  },

  /** Lighter version for the dashboard — only payments + invoices. */
  async fetchForDashboard(): Promise<Pick<RevenueRawData, 'payments' | 'invoices'>> {
    const [pmtRes, invRes] = await Promise.all([
      apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME, moduleName: 'payment', query: {}, limit: 0, skip: 0,
      }),
      apiClient.post('/api/v1/mongo/getdata', {
        appName: APP_NAME, moduleName: 'invoice', query: {}, limit: 0, skip: 0,
      }),
    ]);

    return {
      payments: Array.isArray(pmtRes.data?.data) ? pmtRes.data.data : [],
      invoices: Array.isArray(invRes.data?.data) ? invRes.data.data : [],
    };
  },
};
