import { describe, expect, it } from "vitest";
import type { MarketCoin } from "./types";
import { filterAndSortCoins, type ScreenerFilters } from "./screener";

const coins: MarketCoin[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    current_price: 60_000,
    market_cap: 1_200_000_000_000,
    market_cap_rank: 1,
    total_volume: 40_000_000_000,
    price_change_percentage_24h: 2,
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    current_price: 3_000,
    market_cap: 350_000_000_000,
    market_cap_rank: 2,
    total_volume: 15_000_000_000,
    price_change_percentage_24h: -1,
  },
  {
    id: "small-coin",
    symbol: "sml",
    name: "Small Coin",
    current_price: 0.5,
    market_cap: 10_000_000,
    market_cap_rank: 220,
    total_volume: 500_000,
    price_change_percentage_24h: null,
  },
];

const defaults: ScreenerFilters = {
  query: "",
  minMarketCap: "",
  maxMarketCap: "",
  minVolume: "",
  minChange: "",
  maxChange: "",
  sortBy: "market_cap",
};

describe("coin screener filters", () => {
  it("sorts by market cap by default and supports name/symbol search", () => {
    expect(filterAndSortCoins(coins, defaults).map((coin) => coin.id)).toEqual([
      "bitcoin",
      "ethereum",
      "small-coin",
    ]);
    expect(filterAndSortCoins(coins, { ...defaults, query: "ETH" }).map((coin) => coin.id)).toEqual([
      "ethereum",
    ]);
  });

  it("combines market cap, volume, and 24-hour change ranges", () => {
    const filtered = filterAndSortCoins(coins, {
      ...defaults,
      minMarketCap: "100000000000",
      maxMarketCap: "1300000000000",
      minVolume: "10000000000",
      minChange: "0",
      maxChange: "3",
    });

    expect(filtered.map((coin) => coin.id)).toEqual(["bitcoin"]);
  });

  it("sorts by volume and change while keeping missing values last", () => {
    expect(filterAndSortCoins(coins, { ...defaults, sortBy: "volume" }).map((coin) => coin.id)).toEqual([
      "bitcoin",
      "ethereum",
      "small-coin",
    ]);
    expect(
      filterAndSortCoins(coins, { ...defaults, sortBy: "change_asc" }).map((coin) => coin.id),
    ).toEqual(["ethereum", "bitcoin", "small-coin"]);
  });
});
