import { beforeEach, describe, expect, it } from "vitest";
import { safeLocalStorage } from "../storage";
import { useAppStore } from "./useAppStore";

describe("app persistence state", () => {
  beforeEach(() => {
    useAppStore.setState({
      theme: "dark",
      watchlistIds: [],
      portfolio: [],
    });
  });

  it("deduplicates watchlist ids and toggles them", () => {
    useAppStore.getState().setWatchlistIds(["bitcoin", "bitcoin", "ethereum", ""]);
    expect(useAppStore.getState().watchlistIds).toEqual(["bitcoin", "ethereum"]);

    useAppStore.getState().toggleWatchlist("bitcoin");
    useAppStore.getState().toggleWatchlist("solana");
    expect(useAppStore.getState().watchlistIds).toEqual(["ethereum", "solana"]);
  });

  it("adds, updates, and removes portfolio assets", () => {
    useAppStore.getState().addPortfolioAsset({ id: "bitcoin", amount: 2, buyPrice: 30000 });
    useAppStore.getState().updatePortfolioAsset("bitcoin", { amount: 3, buyPrice: 32000 });
    expect(useAppStore.getState().portfolio).toEqual([
      { id: "bitcoin", amount: 3, buyPrice: 32000 },
    ]);

    useAppStore.getState().removePortfolioAsset("bitcoin");
    expect(useAppStore.getState().portfolio).toEqual([]);
  });

  it("merges duplicate portfolio assets using a weighted buy price", () => {
    useAppStore.getState().addPortfolioAsset({
      id: "bitcoin",
      amount: 2,
      buyPrice: 30000,
      purchasedAt: "2026-01-01T00:00:00.000Z",
    });
    useAppStore.getState().addPortfolioAsset({
      id: "bitcoin",
      amount: 1,
      buyPrice: 36000,
      purchasedAt: "2026-02-01T00:00:00.000Z",
    });

    expect(useAppStore.getState().portfolio).toEqual([
      {
        id: "bitcoin",
        amount: 3,
        buyPrice: 32000,
        purchasedAt: "2026-02-01T00:00:00.000Z",
      },
    ]);
  });

  it("ignores malformed persisted JSON", () => {
    expect(safeLocalStorage.getItem("malformed")).toBeNull();
  });
});