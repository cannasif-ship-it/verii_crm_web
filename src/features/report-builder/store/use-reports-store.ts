import { create } from 'zustand';
import type { ReportDto } from '../types';

interface ReportsState {
  search: string;
  items: ReportDto[];
  loading: boolean;
  error: string | null;
  setSearch: (v: string) => void;
  setItems: (v: ReportDto[]) => void;
  setLoading: (v: boolean) => void;
  setError: (v: string | null) => void;
}

export const useReportsStore = create<ReportsState>((set) => ({
  search: '',
  items: [],
  loading: false,
  error: null,
  setSearch: (v) => set({ search: v }),
  setItems: (v) => set({ items: v }),
  setLoading: (v) => set({ loading: v }),
  setError: (v) => set({ error: v }),
}));
