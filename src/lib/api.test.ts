import { describe, expect, it } from "vitest";
import { getMarketsUrl, normalizeChartData } from "./api";

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
});