import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  readConcepts: string[];
  toggleReadConcept: (slug: string) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
      readConcepts: [],
      toggleReadConcept: (slug) =>
        set((state) => ({
          readConcepts: state.readConcepts.includes(slug)
            ? state.readConcepts.filter((s) => s !== slug)
            : [...state.readConcepts, slug],
        })),
      favorites: [],
      toggleFavorite: (slug) =>
        set((state) => ({
          favorites: state.favorites.includes(slug)
            ? state.favorites.filter((s) => s !== slug)
            : [...state.favorites, slug],
        })),
    }),
    {
      name: 'react-vue-trans-ui-store',
    }
  )
);
