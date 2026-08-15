import { create } from 'zustand';

interface GramPulseStore {
  // Global Filters
  selectedState: string;
  selectedDistrict: string;
  selectedSector: string;
  setFilter: (key: 'selectedState' | 'selectedDistrict' | 'selectedSector', value: string) => void;
  setDateRange: (from: string, to: string) => void;

  // Navigation state that needs to survive across components
  selectedEnterpriseId: string | null;
  setSelectedEnterpriseId: (id: string | null) => void;

  // Auth / Current User
  currentUser: any | null;
  token: string | null;
  setCurrentUser: (user: any, token: string) => void;
  logout: () => void;
}

export const useGramPulseStore = create<GramPulseStore>((set) => ({
  // Default to Maharashtra for the hackathon
  selectedState: 'Maharashtra',
  selectedDistrict: 'All Districts',
  selectedSector: 'All Sectors',
  
  // Default to YTD
  dateRange: {
    from: '2026-01-01',
    to: '2026-08-31'
  },

  setFilter: (key, value) => set((state) => ({ ...state, [key]: value })),
  setDateRange: (from, to) => set((state) => ({ ...state, dateRange: { from, to } })),

  selectedEnterpriseId: null,
  setSelectedEnterpriseId: (id) => set({ selectedEnterpriseId: id }),

  currentUser: null,
  token: null,
  setCurrentUser: (user, token) => set({ currentUser: user, token }),
  logout: () => set({ currentUser: null, token: null }),
}));

