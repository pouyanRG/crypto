import type { PortfolioAsset } from "./types";

export interface PositionPnL {
  id: string;
  amount: number;
  buyPrice: number;
  currentPrice: number | null;
  costBasis: number;
  currentValue: number | null;
  absolutePnL: number | null;
  percentPnL: number | null;
}

export interface PortfolioSummary {
  positions: PositionPnL[];
  totalCost: number;
  totalValue: number | null;
  absolutePnL: number | null;
  percentPnL: number | null;
}

export type PriceMap = Record<string, number | null | undefined>;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Cost basis = amount × buy price. */
export function calcCostBasis(amount: number, buyPrice: number): number | null {
  if (!isFiniteNumber(amount) || !isFiniteNumber(buyPrice) || amount < 0 || buyPrice < 0) {
    return null;
  }
  return amount * buyPrice;
}

/** Current market value = amount × current price. */
export function calcCurrentValue(amount: number, currentPrice: number | null | undefined): number | null {
  if (!isFiniteNumber(amount) || amount < 0 || !isFiniteNumber(currentPrice) || currentPrice < 0) {
    return null;
  }
  return amount * currentPrice;
}

/**
 * Pure P/L for a single asset.
 * absolute = currentValue − costBasis
 * percent = (absolute / costBasis) × 100
 */
export function calcAssetPnL(
  asset: Pick<PortfolioAsset, "id" | "amount" | "buyPrice">,
  currentPrice: number | null | undefined,
): PositionPnL {
  const costBasis = calcCostBasis(asset.amount, asset.buyPrice) ?? 0;
  const currentValue = calcCurrentValue(asset.amount, currentPrice);
  const price = isFiniteNumber(currentPrice) ? currentPrice : null;

  if (currentValue == null) {
    return {
      id: asset.id,
      amount: asset.amount,
      buyPrice: asset.buyPrice,
      currentPrice: price,
      costBasis,
      currentValue: null,
      absolutePnL: null,
      percentPnL: null,
    };
  }

  const absolutePnL = currentValue - costBasis;
  const percentPnL = costBasis === 0 ? null : (absolutePnL / costBasis) * 100;

  return {
    id: asset.id,
    amount: asset.amount,
    buyPrice: asset.buyPrice,
    currentPrice: price,
    costBasis,
    currentValue,
    absolutePnL,
    percentPnL,
  };
}

/** Aggregate portfolio P/L from assets + a map of current prices by coin id. */
export function calcPortfolioSummary(
  assets: ReadonlyArray<Pick<PortfolioAsset, "id" | "amount" | "buyPrice">>,
  pricesById: PriceMap = {},
): PortfolioSummary {
  const positions = assets.map((asset) => calcAssetPnL(asset, pricesById[asset.id]));
  const totalCost = positions.reduce((sum, position) => sum + position.costBasis, 0);

  const hasMissingPrice = positions.some((position) => position.currentValue == null);
  if (hasMissingPrice || positions.length === 0) {
    const knownValue = positions.every((position) => position.currentValue == null)
      ? null
      : positions.reduce((sum, position) => sum + (position.currentValue ?? 0), 0);

    return {
      positions,
      totalCost,
      totalValue: positions.length === 0 ? null : knownValue,
      absolutePnL: null,
      percentPnL: null,
    };
  }

  const totalValue = positions.reduce((sum, position) => sum + (position.currentValue ?? 0), 0);
  const absolutePnL = totalValue - totalCost;
  const percentPnL = totalCost === 0 ? null : (absolutePnL / totalCost) * 100;

  return {
    positions,
    totalCost,
    totalValue,
    absolutePnL,
    percentPnL,
  };
}
