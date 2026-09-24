import { describe, expect, it } from "vitest";
import { getGlobalMarketChartUrl, getMarketsUrl, normalizeChartData } from "./api";
import { isChartResponse, isMarketCoin } from "./types";

describe("CoinGecko API contracts", () => {
  it("builds a USD market query with the requested page", () => {
    const url = new URL(getMarketsUrl({ page: 2, perPage: 10, ids: ["bitcoin"] }), "http://localhost");

    expect(url.searchParams.get("vs_currency")).toBe("usd");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("per_page")).toBe("10");
    expect(url.searchParams.get("ids")).toBe("bitcoin");
  });

  it("normalizes chart tuples into typed points", () => {
    expect(normalizeChartData({ prices: [[1000, 42], [2000, 44]] })).toEqual([
      { timestamp: 1000, price: 42 },
      { timestamp: 2000, price: 44 },
    ]);
  });

  it("builds the real global market chart query", () => {
    const url = new URL(getGlobalMarketChartUrl(30), "http://localhost");

    expect(url.pathname).toBe("/api/coingecko/global/market_cap_chart");
    expect(url.searchParams.get("vs_currency")).toBe("usd");
    expect(url.searchParams.get("days")).toBe("30");
  });

  it("accepts partial CoinGecko records and rejects malformed shapes", () => {
    expect(isMarketCoin({ id: "bitcoin", symbol: "btc", name: "Bitcoin" })).toBe(true);
    expect(isMarketCoin({ id: "bitcoin" })).toBe(false);
    expect(isChartResponse({ prices: [[1000, 42]] })).toBe(true);
    expect(isChartResponse({ prices: [[1000]] })).toBe(false);
  });
});