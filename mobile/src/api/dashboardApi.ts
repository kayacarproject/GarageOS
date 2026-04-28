import { revenueApi } from './revenueApi';
import apiClient from './client';
import {
  calcRevenue,
  calcPendingCollections,
  calcPendingCount,
  getDateRange,
} from '../utils/revenueUtils';

const APP_NAME = 'garageosapp.hanaplatform.com';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardRevenue {
  revenueToday:        number;
  revenueMonth:        number;
  pendingPayments:     number;
  pendingPaymentCount: number;
}

export interface DashboardJobSummary {
  total:     number;
  active:    number;
  pending:   number;
  completed: number;
  cancelled: number;
}

export interface DashboardRecentJobCard {
  _id:               string;
  registrationNumber?: string;
  brand?:            string;
  model?:            string;
  workType:          string;
  status:            string;
  estimatedTotal?:   number;
  createdAt?:        string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * Revenue KPIs for the owner dashboard cards.
   * Reuses revenueApi + revenueUtils — same logic as RevenueScreen.
   */
  async getRevenue(): Promise<DashboardRevenue> {
    const { payments, invoices } = await revenueApi.fetchForDashboard();

    const todayRange = getDateRange('today');
    const monthRange = getDateRange('month');

    return {
      revenueToday:        calcRevenue(payments, todayRange),
      revenueMonth:        calcRevenue(payments, monthRange),
      pendingPayments:     calcPendingCollections(invoices),
      pendingPaymentCount: calcPendingCount(invoices),
    };
  },

  /**
   * Job card status counts for the dashboard.
   */
  async getJobSummary(): Promise<DashboardJobSummary> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'jobcard',
      query:      {},
      limit:      0,
      skip:       0,
    });
    const cards: any[] = Array.isArray(data?.data) ? data.data : [];

    return {
      total:     cards.length,
      active:    cards.filter(c => c.status === 'open' || c.status === 'in_progress').length,
      pending:   cards.filter(c => c.status === 'open').length,
      completed: cards.filter(c => c.status === 'completed').length,
      cancelled: cards.filter(c => c.status === 'cancelled').length,
    };
  },

  /**
   * Fetches the N most-recently created job cards.
   */
  async getRecentJobCards(limit = 5): Promise<DashboardRecentJobCard[]> {
    const { data } = await apiClient.post('/api/v1/mongo/getdata', {
      appName:    APP_NAME,
      moduleName: 'jobcard',
      query:      {},
      limit,
      skip:       0,
    });
    return Array.isArray(data?.data) ? data.data : [];
  },
};
