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

  it("merges multiple normalized series by aligned index", () => {
    const rows = buildCompareChartRows([
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
});
