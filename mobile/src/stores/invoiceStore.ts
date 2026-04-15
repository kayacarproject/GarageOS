import { create } from 'zustand';
import type { Invoice } from '../types';
import { invoiceService, CollectPaymentParams, CollectPaymentResult } from '../services/invoiceService';
import { dummyInvoices } from '../dummy/invoices';

interface InvoiceState {
  invoices: Invoice[];
  load: () => void;
  collectPayment: (params: CollectPaymentParams) => Promise<CollectPaymentResult>;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [...dummyInvoices],

  load: () => set({ invoices: [...dummyInvoices] }),

  collectPayment: async (params) => {
    const result = await invoiceService.collectPayment(params);
    // Sync store with the mutated dummyInvoices array
    set({ invoices: [...dummyInvoices] });
    return result;
  },
}));
