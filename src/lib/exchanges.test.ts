import { describe, expect, it } from "vitest";
import {
  computeVolumeChange,
  filterAndSortExchanges,
  getCountryIso,
  getCountryOptions,
  getTrustTier,
  trustTierVariant,
} from "./exchanges";

describe("exchange utilities", () => {
  const exchanges = [
    { id: "binance", name: "Binance", country: "Cayman Islands", trust_score: 9.6, trade_volume_24h_btc: 120 },
    { id: "coinbase", name: "Coinbase", country: "United States", trust_score: 7.1, trade_volume_24h_btc: 80 },
    { id: "kraken", name: "Kraken", country: "United States", trust_score: null, trade_volume_24h_btc: 40 },
    { id: "bybit", name: "Bybit", country: "Seychelles", trust_score: 5.5, trade_volume_24h_btc: 200 },
  ];

  it("classifies trust tiers and variants", () => {
    expect(getTrustTier(9.8)).toBe("high");
    expect(getTrustTier(8)).toBe("medium");
    expect(getTrustTier(5)).toBe("low");
    expect(getTrustTier(null)).toBe("none");
    expect(trustTierVariant("high")).toBe("up");
    expect(trustTierVariant("medium")).toBe("neutral");
    expect(trustTierVariant("low")).toBe("warning");
    expect(trustTierVariant("none")).toBe("neutral");
  });

  it("computes volume changes with safety guards", () => {
    expect(computeVolumeChange([
      { timestamp: 1, value: 100 },
      { timestamp: 2, value: 120 },
    ])).toBeCloseTo(20, 5);
    expect(computeVolumeChange([{ timestamp: 1, value: 5 }])).toBeNull();
    expect(computeVolumeChange([
      { timestamp: 1, value: 0 },
      { timestamp: 2, value: 10 },
    ])).toBeNull();
  });

  it("filters and sorts exchanges by country, rating, and search query", () => {
    expect(filterAndSortExchanges(exchanges, { query: "bin", country: "", rating: "all", sortBy: "volume" })).toHaveLength(1);
    expect(filterAndSortExchanges(exchanges, { query: "", country: "United States", rating: "all", sortBy: "volume" })).toHaveLength(2);
    expect(filterAndSortExchanges(exchanges, { query: "", country: "", rating: "high", sortBy: "trust" })).toHaveLength(1);
    expect(filterAndSortExchanges(exchanges, { query: "", country: "", rating: "low", sortBy: "name" })).toHaveLength(1);
    expect(filterAndSortExchanges(exchanges, { query: "", country: "", rating: "all", sortBy: "name" }).map((item) => item.id)).toEqual(["binance", "bybit", "coinbase", "kraken"]);
  });

  it("derives country options and ISO codes", () => {
    expect(getCountryOptions(exchanges)).toEqual(["Cayman Islands", "Seychelles", "United States"]);
    expect(getCountryIso("United States")).toBe("us");
    expect(getCountryIso("United Arab Emirates")).toBe("ae");
    expect(getCountryIso("Unknown Country")).toBeNull();
    expect(getCountryIso(null)).toBeNull();
  });
});
