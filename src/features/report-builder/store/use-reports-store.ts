import { create } from 'zustand';

interface ReportsState {
  search: string;
  setSearch: (v: string) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  search: '',
  setSearch: (v) => set({ search: v }),
}));
