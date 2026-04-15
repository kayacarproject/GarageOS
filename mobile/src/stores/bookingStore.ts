import { create } from 'zustand';
import { Booking, BookingStatus, CreateBookingPayload } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingState {
  bookings: Booking[];
  bookingsByDate: Booking[];
  pendingForCustomer: Booking[];
  isLoading: boolean;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetchByDate: (date: string) => Promise<void>;
  create: (payload: CreateBookingPayload & { created_by: string }) => Promise<Booking>;
  update: (id: string, payload: Partial<Booking>) => Promise<void>;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  linkToJobCard: (bookingId: string, jobCardId: string) => Promise<void>;
  getPendingForCustomer: (customerId: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  bookingsByDate: [],
  pendingForCustomer: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookings = await bookingService.getAll();
      set({ bookings });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchByDate: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const bookingsByDate = await bookingService.getByDate(date);
      set({ bookingsByDate });
    } finally {
      set({ isLoading: false });
    }
  },

  create: async (payload) => {
    const newB = await bookingService.create(payload);
    set(s => ({ bookings: [newB, ...s.bookings] }));
    return newB;
  },

  update: async (id, payload) => {
    const updated = await bookingService.update(id, payload as any);
    set(s => ({
      bookings: s.bookings.map(b => b.id === id ? updated : b),
      bookingsByDate: s.bookingsByDate.map(b => b.id === id ? updated : b),
    }));
  },

  updateStatus: async (id, status) => {
    const updated = await bookingService.updateStatus(id, status);
    set(s => ({
      bookings: s.bookings.map(b => b.id === id ? updated : b),
      bookingsByDate: s.bookingsByDate.map(b => b.id === id ? updated : b),
    }));
  },

  linkToJobCard: async (bookingId, jobCardId) => {
    const updated = await bookingService.linkToJobCard(bookingId, jobCardId);
    set(s => ({
      bookings: s.bookings.map(b => b.id === bookingId ? updated : b),
    }));
  },

  getPendingForCustomer: async (customerId) => {
    const pendingForCustomer = await bookingService.getPendingForCustomer(customerId);
    set({ pendingForCustomer });
  },
}));
