import type { ChartPoint } from "./types";

export type CompareSeriesInput = {
  id: string;
  label: string;
  points: ChartPoint[];
};

export type CompareChartRow = {
  timestamp: number;
  label: string;
  [seriesKey: string]: number | string;
};

/** Normalize each price to an index where the first point equals 100. */
export function normalizeSeriesBaseline100(points: ChartPoint[]): number[] {
  if (points.length === 0) return [];
  const start = points[0]?.price;
  if (start == null || !Number.isFinite(start) || start === 0) return [];
  return points.map((point) => (point.price / start) * 100);
}

/**
 * Align series by index (same `days` query from CoinGecko) and emit Recharts rows.
 * Each coin id becomes a data key with normalized values.
 */
export function buildCompareChartRows(seriesList: CompareSeriesInput[]): CompareChartRow[] {
  if (seriesList.length === 0) return [];

  const prepared = seriesList.map((series) => ({
    id: series.id,
    values: normalizeSeriesBaseline100(series.points),
    points: series.points,
  }));

  const minLen = Math.min(...prepared.map((entry) => entry.values.length));
  if (minLen < 2) return [];

  const rows: CompareChartRow[] = [];
  for (let index = 0; index < minLen; index += 1) {
    const timestamp = prepared[0].points[index]?.timestamp;
    if (timestamp == null || !Number.isFinite(timestamp)) continue;

    const row: CompareChartRow = {
      timestamp,
      label: new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };

    for (const entry of prepared) {
      const value = entry.values[index];
      if (value != null && Number.isFinite(value)) {
        row[entry.id] = value;
      }
    }

    rows.push(row);
  }

  return rows;
}
