import { describe, expect, it } from "vitest";
import {
  getMarketDataFreshness,
  isMarketDataStale,
  MARKET_DATA_STALE_AFTER_MS,
} from "./marketFreshness";

describe("market data freshness", () => {
  it("uses the oldest provider timestamp in a market response", () => {
    const newest = Date.parse("2026-11-03T12:01:00Z");
    const oldest = Date.parse("2026-11-03T12:00:00Z");

    expect(
      getMarketDataFreshness(
        [
          { id: "bitcoin", last_updated: new Date(newest).toISOString() },
          { id: "ethereum", last_updated: new Date(oldest).toISOString() },
        ],
        Date.parse("2026-11-03T12:02:00Z"),
      ),
    ).toEqual({ timestamp: oldest, source: "provider" });
  });

  it("falls back to the last successful response when source timestamps are missing", () => {
    const responseUpdatedAt = Date.parse("2026-11-03T12:00:00Z");

    expect(getMarketDataFreshness([{ id: "bitcoin" }], responseUpdatedAt)).toEqual({
      timestamp: responseUpdatedAt,
      source: "response",
    });
    expect(getMarketDataFreshness(undefined, 0)).toBeNull();
  });

  it("marks data delayed only after the configured freshness window", () => {
    const updatedAt = Date.parse("2026-11-03T12:00:00Z");

    expect(isMarketDataStale(updatedAt, updatedAt + MARKET_DATA_STALE_AFTER_MS)).toBe(false);
    expect(isMarketDataStale(updatedAt, updatedAt + MARKET_DATA_STALE_AFTER_MS + 1)).toBe(true);
  });
});
