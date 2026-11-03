import { beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { safeLocalStorage } from "../storage";
import { useAppStore } from "./useAppStore";

describe("app persistence state", () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: "dark",
      watchlistIds: [],
    });
  });

  it("deduplicates watchlist ids and toggles them", () => {
    useAppStore.getState().setWatchlistIds(["bitcoin", "bitcoin", "ethereum", ""]);
    expect(useAppStore.getState().watchlistIds).toEqual(["bitcoin", "ethereum"]);

    useAppStore.getState().toggleWatchlist("bitcoin");
    useAppStore.getState().toggleWatchlist("solana");
    expect(useAppStore.getState().watchlistIds).toEqual(["ethereum", "solana"]);
  });

  it("removes old portfolio data from persisted state", async () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (name: string) => values.get(name) ?? null,
      setItem: (name: string, value: string) => {
        values.set(name, value);
      },
      removeItem: (name: string) => {
        values.delete(name);
      },
    };
    const originalStorage = createJSONStorage(() => safeLocalStorage);

    useAppStore.persist.setOptions({ storage: createJSONStorage(() => storage) });
    storage.setItem(
      "crypto-dashboard:app-state",
      JSON.stringify({
        state: {
          theme: "light",
          watchlistIds: ["bitcoin"],
          portfolio: [{ id: "bitcoin", amount: 2, buyPrice: 30000 }],
        },
        version: 0,
      }),
    );

    try {
      await useAppStore.persist.rehydrate();

      expect(useAppStore.getState().theme).toBe("light");
      expect(useAppStore.getState().watchlistIds).toEqual(["bitcoin"]);
      const persisted = JSON.parse(values.get("crypto-dashboard:app-state") ?? "null");
      expect(persisted.state).not.toHaveProperty("portfolio");
    } finally {
      useAppStore.persist.setOptions({ storage: originalStorage });
    }
  });

  it("rejects unsafe watchlist ids and invalid themes", () => {
    useAppStore.getState().setTheme("purple" as never);
    useAppStore.getState().setWatchlistIds(["bitcoin", "../evil", "bitcoin", "solana_1", "<script>"]);

    expect(useAppStore.getState().theme).toBe("dark");
    expect(useAppStore.getState().watchlistIds).toEqual(["bitcoin", "solana_1"]);

    useAppStore.getState().toggleWatchlist("javascript:alert(1)");
    expect(useAppStore.getState().watchlistIds).toEqual(["bitcoin", "solana_1"]);
  });

  it("ignores malformed persisted JSON", () => {
    expect(safeLocalStorage.getItem("malformed")).toBeNull();
  });
});