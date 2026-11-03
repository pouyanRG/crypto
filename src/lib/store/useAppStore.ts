import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeLocalStorage } from "../storage";
import type { Theme } from "../types";

const SAFE_THEME_VALUES: Theme[] = ["dark", "light"];
const WATCHLIST_ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/i;

function normalizeWatchlistId(value: string): string {
  const normalized = value.trim().toLowerCase();
  return WATCHLIST_ID_PATTERN.test(normalized) ? normalized : "";
}

function sanitizeWatchlistIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];

  return [...new Set(
    ids
      .filter((id): id is string => typeof id === "string")
      .map((id) => normalizeWatchlistId(id))
      .filter((id) => id.length > 0),
  )];
}

export interface AppState {
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
      setTheme: (theme) => set({ theme: SAFE_THEME_VALUES.includes(theme) ? theme : "dark" }),
      setWatchlistIds: (ids) => set({ watchlistIds: sanitizeWatchlistIds(ids) }),
      toggleWatchlist: (id) => {
        const normalizedId = normalizeWatchlistId(id);
        if (!normalizedId) {
          return;
        }

        set((state) => ({
          watchlistIds: state.watchlistIds.includes(normalizedId)
            ? state.watchlistIds.filter((item) => item !== normalizedId)
            : [...state.watchlistIds, normalizedId],
        }));
      },
    }),
    {
      name: "crypto-dashboard:app-state",
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        theme: SAFE_THEME_VALUES.includes(state.theme) ? state.theme : "dark",
        watchlistIds: sanitizeWatchlistIds(state.watchlistIds),
      }),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object" || Array.isArray(persistedState)) {
          return {};
        }
        const migrated = { ...(persistedState as Record<string, unknown>) };
        delete migrated.portfolio;
        return migrated;
      },
      merge: (persisted, current) => {
        const stored = persisted as Partial<AppState> | undefined;
        const watchlistIds = sanitizeWatchlistIds(stored?.watchlistIds ?? current.watchlistIds);
        const theme = stored?.theme === "light" || stored?.theme === "dark" ? stored.theme : current.theme;

        return {
          ...current,
          theme,
          watchlistIds,
        };
      },
      skipHydration: true,
    },
  ),
);
