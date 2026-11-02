import { describe, expect, it } from "vitest";
import {
  getExchangesUrl,
  getMarketsUrl,
  getTrendingUrl,
  normalizeChartData,
  parseDefiChains,
  parseDefiProtocols,
  parseExchanges,
  parseTrendingCoins,
} from "./api";
import { isChartResponse, isMarketCoin } from "./types";

describe("CoinGecko API contracts", () => {
  it("builds a USD market query with the requested page", () => {
    const url = new URL(getMarketsUrl({ page: 2, perPage: 10, ids: ["bitcoin"] }), "http://localhost");

    expect(url.searchParams.get("vs_currency")).toBe("usd");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("per_page")).toBe("10");
    expect(url.searchParams.get("ids")).toBe("bitcoin");
    expect(url.searchParams.get("sparkline")).toBe("true");
    expect(
      new URL(getMarketsUrl({ perPage: 250, sparkline: false }), "http://localhost")
        .searchParams.get("sparkline"),
    ).toBe("false");
  });

  it("normalizes chart tuples into typed points", () => {
    expect(normalizeChartData({ prices: [[1000, 42], [2000, 44]] })).toEqual([
      { timestamp: 1000, price: 42 },
      { timestamp: 2000, price: 44 },
    ]);
  });

  it("builds exchange and trending endpoints", () => {
    const exchangesUrl = new URL(getExchangesUrl(50, 2), "http://localhost");

    expect(exchangesUrl.pathname).toBe("/api/coingecko/exchanges");
    expect(exchangesUrl.searchParams.get("per_page")).toBe("50");
    expect(exchangesUrl.searchParams.get("page")).toBe("2");
    expect(new URL(getTrendingUrl(), "http://localhost").pathname).toBe(
      "/api/coingecko/search/trending",
    );
  });

  it("parses exchange rankings and trending coins", () => {
    expect(parseExchanges([
      { id: "example", name: "Example Exchange", trade_volume_24h_btc: 120, trust_score: 9 },
    ])).toEqual([
      {
        id: "example",
        name: "Example Exchange",
        image: undefined,
        country: undefined,
        trust_score: 9,
        trust_score_rank: undefined,
        trade_volume_24h_btc: 120,
      },
    ]);

    expect(parseTrendingCoins({
      coins: [{
        item: {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "btc",
          market_cap_rank: 1,
          data: { price: 60000, price_change_percentage_24h: { usd: 2.5 } },
        },
      }],
    })).toEqual([
      {
        id: "bitcoin",
        name: "Bitcoin",
        symbol: "btc",
        thumb: undefined,
        market_cap_rank: 1,
        score: undefined,
        price: 60000,
        price_change_percentage_24h: 2.5,
      },
    ]);
  });

  it("rejects malformed exchange and trending responses", () => {
    expect(() => parseExchanges({})).toThrow("invalid exchange list");
    expect(() => parseTrendingCoins({ coins: [{ item: { id: "bitcoin" } }] })).toThrow(
      "malformed trending coin data",
    );
  });

  it("parses DeFiLlama protocol and chain TVL datasets", () => {
    expect(parseDefiProtocols([
      {
        id: "aave",
        name: "Aave",
        symbol: "AAVE",
        category: "Lending",
        chains: ["Ethereum", "Polygon"],
        tvl: 1_000_000,
        change_1d: 1.5,
        change_7d: -2,
      },
    ])).toEqual([
      {
        id: "aave",
        name: "Aave",
        symbol: "AAVE",
        category: "Lending",
        chains: ["Ethereum", "Polygon"],
        tvl: 1_000_000,
        change_1d: 1.5,
        change_7d: -2,
      },
    ]);

    expect(parseDefiChains([
      { name: "Ethereum", tvl: 50_000_000, tokenSymbol: "ETH", chainId: 1 },
    ])).toEqual([
      { name: "Ethereum", tvl: 50_000_000, tokenSymbol: "ETH", chainId: 1 },
    ]);
  });

  it("rejects malformed DeFiLlama datasets", () => {
    expect(() => parseDefiProtocols([{ name: "Missing TVL" }])).toThrow(
      "malformed protocol data",
    );
    expect(() => parseDefiChains([{ name: "Missing TVL" }])).toThrow("malformed chain data");
  });

  it("accepts partial CoinGecko records and rejects malformed shapes", () => {
    expect(isMarketCoin({ id: "bitcoin", symbol: "btc", name: "Bitcoin" })).toBe(true);
    expect(isMarketCoin({ id: "bitcoin" })).toBe(false);
    expect(isChartResponse({ prices: [[1000, 42]] })).toBe(true);
    expect(isChartResponse({ prices: [[1000]] })).toBe(false);
  });
});