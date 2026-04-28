import { create } from 'zustand';
import { jobcardApi, HanaJobCard } from '../api/jobcardApi';

interface HanaJobCardState {
  jobCards:  HanaJobCard[];
  isLoading: boolean;
  fetchAll:  () => Promise<void>;
}

export const useHanaJobCardStore = create<HanaJobCardState>((set) => ({
  jobCards:  [],
  isLoading: false,

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const jobCards = await jobcardApi.getAll();
      set({ jobCards });
    } catch {
      // keep stale list on error
    } finally {
      set({ isLoading: false });
    }
  },
}));
