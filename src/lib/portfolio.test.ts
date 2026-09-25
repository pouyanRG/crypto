import { describe, expect, it } from "vitest";
import { calcAssetPnL, calcCostBasis, calcCurrentValue, calcPortfolioSummary } from "./portfolio";

describe("portfolio P/L helpers", () => {
  it("calculates cost basis and current value", () => {
    expect(calcCostBasis(2, 30000)).toBe(60000);
    expect(calcCurrentValue(2, 35000)).toBe(70000);
    expect(calcCostBasis(-1, 10)).toBeNull();
    expect(calcCurrentValue(1, null)).toBeNull();
  });

  it("computes absolute and percent P/L for a single asset", () => {
    const result = calcAssetPnL({ id: "bitcoin", amount: 1, buyPrice: 40000 }, 45000);
    expect(result.costBasis).toBe(40000);
    expect(result.currentValue).toBe(45000);
    expect(result.absolutePnL).toBe(5000);
    expect(result.percentPnL).toBeCloseTo(12.5);
  });

  it("returns null P/L when current price is missing", () => {
    const result = calcAssetPnL({ id: "ethereum", amount: 2, buyPrice: 2000 }, null);
    expect(result.currentValue).toBeNull();
    expect(result.absolutePnL).toBeNull();
    expect(result.percentPnL).toBeNull();
  });

  it("handles zero cost basis without dividing by zero", () => {
    const result = calcAssetPnL({ id: "free", amount: 1, buyPrice: 0 }, 10);
    expect(result.absolutePnL).toBe(10);
    expect(result.percentPnL).toBeNull();
  });

  it("aggregates portfolio summary across assets", () => {
    const summary = calcPortfolioSummary(
      [
        { id: "bitcoin", amount: 1, buyPrice: 30000 },
        { id: "ethereum", amount: 2, buyPrice: 2000 },
      ],
      { bitcoin: 35000, ethereum: 2500 },
    );

    expect(summary.totalCost).toBe(34000);
    expect(summary.totalValue).toBe(40000);
    expect(summary.absolutePnL).toBe(6000);
    expect(summary.percentPnL).toBeCloseTo((6000 / 34000) * 100);
    expect(summary.positions).toHaveLength(2);
  });

  it("keeps portfolio-level P/L null when any price is missing", () => {
    const summary = calcPortfolioSummary(
      [
        { id: "bitcoin", amount: 1, buyPrice: 30000 },
        { id: "ethereum", amount: 2, buyPrice: 2000 },
      ],
      { bitcoin: 35000 },
    );

    expect(summary.absolutePnL).toBeNull();
    expect(summary.percentPnL).toBeNull();
    expect(summary.positions[0].absolutePnL).toBe(5000);
    expect(summary.positions[1].absolutePnL).toBeNull();
  });
});
