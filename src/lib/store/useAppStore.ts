import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Theme } from "../types";

interface AppState {
  theme: Theme;
  watchlistIds: string[];
  setTheme: (theme: Theme) => void;
  setWatchlistIds: (ids: string[]) => void;
  toggleWatchlist: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      watchlistIds: [],
      setTheme: (theme) => set({ theme }),
      setWatchlistIds: (ids) => set({ watchlistIds: [...new Set(ids)] }),
      toggleWatchlist: (id) =>
        set((state) => ({
          watchlistIds: state.watchlistIds.includes(id)
            ? state.watchlistIds.filter((item) => item !== id)
            : [...state.watchlistIds, id],
        })),
    }),
    {
      name: "crypto-dashboard:app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        watchlistIds: state.watchlistIds,
      }),
    },
  ),
);
