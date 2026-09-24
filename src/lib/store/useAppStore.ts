import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { safeLocalStorage } from "../storage";
import type { PortfolioAsset, Theme } from "../types";

function isPortfolioAsset(value: unknown): value is PortfolioAsset {
  if (!value || typeof value !== "object") return false;
  const asset = value as Partial<PortfolioAsset>;
  return (
    typeof asset.id === "string" &&
    asset.id.length > 0 &&
    typeof asset.amount === "number" &&
    Number.isFinite(asset.amount) &&
    typeof asset.buyPrice === "number" &&
    Number.isFinite(asset.buyPrice) &&
    (asset.purchasedAt === undefined || typeof asset.purchasedAt === "string")
  );
}

export interface AppState {
  theme: Theme;
  watchlistIds: string[];
  portfolio: PortfolioAsset[];
  setTheme: (theme: Theme) => void;
  setWatchlistIds: (ids: string[]) => void;
  toggleWatchlist: (id: string) => void;
  addPortfolioAsset: (asset: PortfolioAsset) => void;
  updatePortfolioAsset: (id: string, asset: Omit<PortfolioAsset, "id">) => void;
  removePortfolioAsset: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      watchlistIds: [],
      portfolio: [],
      setTheme: (theme) => set({ theme }),
      setWatchlistIds: (ids) => set({ watchlistIds: [...new Set(ids.filter(Boolean))] }),
      toggleWatchlist: (id) =>
        set((state) => ({
          watchlistIds: state.watchlistIds.includes(id)
            ? state.watchlistIds.filter((item) => item !== id)
            : [...state.watchlistIds, id],
        })),
      addPortfolioAsset: (asset) =>
        set((state) => ({
          portfolio: [...state.portfolio.filter((item) => item.id !== asset.id), asset],
        })),
      updatePortfolioAsset: (id, asset) =>
        set((state) => ({
          portfolio: state.portfolio.map((item) => (item.id === id ? { id, ...asset } : item)),
        })),
      removePortfolioAsset: (id) =>
        set((state) => ({ portfolio: state.portfolio.filter((item) => item.id !== id) })),
    }),
    {
      name: "crypto-dashboard:app-state",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        theme: state.theme,
        watchlistIds: state.watchlistIds,
        portfolio: state.portfolio,
      }),
      merge: (persisted, current) => {
        const stored = persisted as Partial<AppState> | undefined;
        const watchlistIds = Array.isArray(stored?.watchlistIds)
          ? [...new Set(stored.watchlistIds.filter((id): id is string => typeof id === "string" && id.length > 0))]
          : current.watchlistIds;
        const portfolio = Array.isArray(stored?.portfolio)
          ? stored.portfolio.filter(isPortfolioAsset)
          : current.portfolio;

        return {
          ...current,
          theme: stored?.theme === "light" || stored?.theme === "dark" ? stored.theme : current.theme,
          watchlistIds,
          portfolio,
        };
      },
      skipHydration: true,
    },
  ),
);
