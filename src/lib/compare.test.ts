import { describe, expect, it } from "vitest";
import { buildCompareChartRows, normalizeSeriesBaseline100 } from "./compare";

describe("compare chart normalization", () => {
  it("indexes the first price to 100", () => {
    expect(
      normalizeSeriesBaseline100([
        { timestamp: 1, price: 50 },
        { timestamp: 2, price: 75 },
      ]),
    ).toEqual([100, 150]);
  });

  it("returns empty when the baseline price is invalid", () => {
    expect(normalizeSeriesBaseline100([{ timestamp: 1, price: 0 }])).toEqual([]);
  });

  it("normalizes multiple series on their shared timestamps", () => {
    const { rows } = buildCompareChartRows([
      {
        id: "bitcoin",
        label: "Bitcoin",
        points: [
          { timestamp: 1000, price: 100 },
          { timestamp: 2000, price: 110 },
        ],
      },
      {
        id: "ethereum",
        label: "Ethereum",
        points: [
          { timestamp: 1000, price: 200 },
          { timestamp: 2000, price: 180 },
        ],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ timestamp: 1000, bitcoin: 100, ethereum: 100 });
    expect(rows[1].bitcoin).toBeCloseTo(110);
    expect(rows[1].ethereum).toBeCloseTo(90);
  });

  it("aligns series with different timestamp intervals using the densest grid", () => {
    const { rows } = buildCompareChartRows([
      {
        id: "bitcoin",
        label: "Bitcoin",
        points: [
          { timestamp: 1000, price: 100 },
          { timestamp: 2000, price: 110 },
          { timestamp: 3000, price: 120 },
        ],
      },
      {
        id: "ethereum",
        label: "Ethereum",
        points: [
          { timestamp: 1500, price: 200 },
          { timestamp: 3000, price: 220 },
        ],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ timestamp: 2000, bitcoin: 100, ethereum: 100 });
    expect(rows[1].timestamp).toBe(3000);
    expect(rows[1].bitcoin).toBeCloseTo(100 * (120 / 110));
    expect(rows[1].ethereum).toBeCloseTo(110);
  });

  it("restricts the grid to the common range when series have different lengths", () => {
    const { rows } = buildCompareChartRows([
      {
        id: "bitcoin",
        label: "Bitcoin",
        points: [
          { timestamp: 1000, price: 100 },
          { timestamp: 2000, price: 110 },
          { timestamp: 3000, price: 120 },
          { timestamp: 4000, price: 130 },
        ],
      },
      {
        id: "ethereum",
        label: "Ethereum",
        points: [
          { timestamp: 2000, price: 200 },
          { timestamp: 3000, price: 220 },
        ],
      },
    ]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ timestamp: 2000, bitcoin: 100, ethereum: 100 });
    expect(rows[1].timestamp).toBe(3000);
    expect(rows[1].bitcoin).toBeCloseTo(100 * (120 / 110));
    expect(rows[1].ethereum).toBeCloseTo(110);
  });

  it("skips an invalid zero-price series without invalidating valid comparisons", () => {
    const result = buildCompareChartRows([
      {
        id: "bitcoin",
        label: "Bitcoin",
        points: [
          { timestamp: 1000, price: 0 },
          { timestamp: 2000, price: 100 },
          { timestamp: 3000, price: 110 },
        ],
      },
      {
        id: "ethereum",
        label: "Ethereum",
        points: [
          { timestamp: 1000, price: 200 },
          { timestamp: 2000, price: 210 },
          { timestamp: 3000, price: 220 },
        ],
      },
      {
        id: "solana",
        label: "Solana",
        points: [
          { timestamp: 1000, price: 50 },
          { timestamp: 2000, price: 60 },
          { timestamp: 3000, price: 70 },
        ],
      },
    ]);

    expect(result.skippedIds).toEqual([]);
    expect(result.rows[0].bitcoin).toBe(100);
    expect(result.rows[0].ethereum).toBe(100);
    expect(result.rows[0].solana).toBe(100);
  });

  it("reports series without valid positive prices as skipped", () => {
    const result = buildCompareChartRows([
      { id: "bitcoin", label: "Bitcoin", points: [{ timestamp: 1000, price: 0 }] },
      {
        id: "ethereum",
        label: "Ethereum",
        points: [
          { timestamp: 1000, price: 200 },
          { timestamp: 2000, price: 220 },
        ],
      },
    ]);

    expect(result.rows).toEqual([]);
    expect(result.skippedIds).toEqual(["bitcoin"]);
  });
});
