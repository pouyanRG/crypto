import type { ChartPoint } from "./types";

export type CompareSeriesInput = {
  id: string;
  label: string;
  points: ChartPoint[];
};

export type CompareChartRow = {
  timestamp: number;
  [seriesKey: string]: number;
};

export type CompareChartRowsResult = {
  rows: CompareChartRow[];
  skippedIds: string[];
};

/** Normalize each price to an index where the first point equals 100. */
export function normalizeSeriesBaseline100(points: ChartPoint[]): number[] {
  if (points.length === 0) return [];
  const start = points[0]?.price;
  if (start == null || !Number.isFinite(start) || start <= 0) return [];
  return points.map((point) => (point.price / start) * 100);
}

function priceAt(points: ChartPoint[], timestamp: number): number | null {
  let low = 0;
  let high = points.length - 1;
  let answer = -1;

  while (low <= high) {
    const middle = (low + high) >> 1;
    if (points[middle].timestamp <= timestamp) {
      answer = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return answer >= 0 ? points[answer].price : null;
}

/** Align price histories to a shared timestamp grid before normalizing them. */
export function buildCompareChartRows(seriesList: CompareSeriesInput[]): CompareChartRowsResult {
  const prepared = seriesList
    .map((series) => ({
      id: series.id,
      points: series.points
        .filter(
          (point) =>
            Number.isFinite(point.timestamp) &&
            Number.isFinite(point.price) &&
            point.price > 0,
        )
        .sort((first, second) => first.timestamp - second.timestamp),
    }))
    .filter((series) => series.points.length > 0);

  const validIds = new Set(prepared.map((series) => series.id));
  const skippedIds = seriesList.filter((series) => !validIds.has(series.id)).map((series) => series.id);
  if (prepared.length < 2) {
    return { rows: [], skippedIds };
  }

  const start = Math.max(...prepared.map((series) => series.points[0].timestamp));
  const end = Math.min(...prepared.map((series) => series.points[series.points.length - 1].timestamp));
  const densest = prepared.reduce((first, second) =>
    second.points.length > first.points.length ? second : first,
  );
  const grid = densest.points
    .map((point) => point.timestamp)
    .filter((timestamp) => timestamp >= start && timestamp <= end);

  if (grid.length < 2) return { rows: [], skippedIds };

  const baseline = new Map(
    prepared.map((series) => [series.id, priceAt(series.points, grid[0])]),
  );
  const rows = grid.map((timestamp) => {
    const row: CompareChartRow = { timestamp };
    for (const series of prepared) {
      const price = priceAt(series.points, timestamp);
      const startPrice = baseline.get(series.id);
      if (price != null && startPrice != null && startPrice > 0) {
        row[series.id] = (price / startPrice) * 100;
      }
    }
    return row;
  });

  return { rows, skippedIds };
}
