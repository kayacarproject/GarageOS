import { create } from 'zustand';
import type { Booking, BookingStatus } from '../types';
import { bookingApi, CreateHanaBookingPayload } from '../api/bookingApi';

interface BookingState {
  bookings:  Booking[];
  isLoading: boolean;

  fetchAll:     () => Promise<void>;
  fetchByDate:  (date: string) => Promise<Booking[]>;
  create:       (payload: CreateHanaBookingPayload) => Promise<Booking>;
  updateStatus: (id: string, status: BookingStatus) => Promise<void>;
  update:       (id: string, payload: Partial<CreateHanaBookingPayload>) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings:  [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const bookings = await bookingApi.getAll();
      set({ bookings });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchByDate: (date) => bookingApi.getByDate(date),

  create: async (payload) => {
    const newBooking = await bookingApi.create(payload);
    set(s => ({ bookings: [newBooking, ...s.bookings] }));
    return newBooking;
  },

  updateStatus: async (id, status) => {
    await bookingApi.updateStatus(id, status);
    set(s => ({
      bookings: s.bookings.map(b => b.id === id ? { ...b, status } : b),
    }));
  },

  update: async (id, payload) => {
    await bookingApi.update(id, payload);
  },
}));
