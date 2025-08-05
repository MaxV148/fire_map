import { create } from 'zustand';
import dayjs from 'dayjs';
import { persist } from 'zustand/middleware';
import { FilterValues } from '../components/FilterPanel';

interface FilterStore {
  // Zustand
  filters: FilterValues;

  // Aktionen
  setFilters: (filters: Partial<FilterValues>) => void;
  resetFilters: () => void;
  setDateRange: (dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null) => void;
  setTags: (tags: number[]) => void;
  setVehicles: (vehicles: number[]) => void;
  setLocation: (city: string | undefined, distance: number | undefined) => void;
}

const initialState: FilterValues = {
  dateRange: null,
  tags: [],
  vehicles: [],
  city: undefined,
  distance: undefined,
  latitude: undefined,
  longitude: undefined
};

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      // Zustand
      filters: { ...initialState },

      // Aktionen
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      resetFilters: () => set(() => ({
        filters: { ...initialState }
      })),
      
      setDateRange: (dateRange) => set((state) => ({
        filters: { ...state.filters, dateRange }
      })),
      
      setTags: (tags) => set((state) => ({
        filters: { ...state.filters, tags }
      })),
      
      setVehicles: (vehicles) => set((state) => ({
        filters: { ...state.filters, vehicles }
      })),
      
      setLocation: (city, distance) => set((state) => ({
        filters: { ...state.filters, city, distance }
      }))
    }),
    {
      name: 'filter-storage',
      partialize: (state) => ({ filters: state.filters })
    }
  )
); 