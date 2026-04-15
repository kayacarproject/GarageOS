import { create } from 'zustand';
import type { JobCard, JobCardStatus, CreateJobCardPayload } from '../types';
import { jobCardService } from '../services/jobCardService';

interface JobCardState {
  jobCards: JobCard[];
  selected: JobCard | null;
  isLoading: boolean;
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  fetchByMechanic: (mechanicId: string) => Promise<void>;
  create: (payload: CreateJobCardPayload) => Promise<void>;
  updateStatus: (id: string, status: JobCardStatus, notes?: string) => Promise<void>;
  update: (id: string, payload: Partial<JobCard>) => Promise<void>;
  assignMechanic: (id: string, mechanicId: string) => Promise<void>;
}

export const useJobCardStore = create<JobCardState>((set) => ({
  jobCards: [],
  selected: null,
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    const jobCards = await jobCardService.getAll();
    set({ jobCards, isLoading: false });
  },

  fetchById: async (id) => {
    set({ isLoading: true });
    const selected = await jobCardService.getById(id);
    set({ selected, isLoading: false });
  },

  fetchByMechanic: async (mechanicId) => {
    set({ isLoading: true });
    const jobCards = await jobCardService.getByMechanic(mechanicId);
    set({ jobCards, isLoading: false });
  },

  create: async (payload) => {
    const newCard = await jobCardService.create(payload);
    set((s) => ({ jobCards: [newCard, ...s.jobCards] }));
  },

  updateStatus: async (id, status, notes) => {
    const updated = await jobCardService.updateStatus(id, status, notes);
    set((s) => ({
      jobCards: s.jobCards.map((j) => (j.id === id ? updated : j)),
      selected: s.selected?.id === id ? updated : s.selected,
    }));
  },

  update: async (id, payload) => {
    const updated = await jobCardService.update(id, payload);
    set((s) => ({
      jobCards: s.jobCards.map((j) => (j.id === id ? updated : j)),
      selected: s.selected?.id === id ? updated : s.selected,
    }));
  },

  assignMechanic: async (id, mechanicId) => {
    const updated = await jobCardService.assignMechanic(id, mechanicId);
    set((s) => ({
      jobCards: s.jobCards.map((j) => (j.id === id ? updated : j)),
      selected: s.selected?.id === id ? updated : s.selected,
    }));
  },
}));
