import type { ChartPoint, ChartResponse, CoinDetail, MarketCoin } from "./types";

export const API_BASE_URL = "/api/coingecko";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    let message = `CoinGecko request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body?.error || body?.status?.error_message || message;
    } catch {
    }

    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export interface MarketsQuery {
  page?: number;
  perPage?: number;
  ids?: string[];
}

export function getMarketsUrl({ page = 1, perPage = 50, ids = [] }: MarketsQuery = {}): string {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,7d",
  });
  if (ids.length > 0) params.set("ids", ids.join(","));
  return `${API_BASE_URL}/coins/markets?${params}`;
}

export function getCoinDetailUrl(id: string): string {
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
}

export function getCoinChartUrl(id: string, days = 30): string {
  const params = new URLSearchParams({ vs_currency: "usd", days: String(days), interval: days > 90 ? "daily" : "hourly" });
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}/market_chart?${params}`;
}

export function normalizeChartData(chart: ChartResponse | undefined): ChartPoint[] {
  return (chart?.prices ?? []).filter(([timestamp, price]) => Number.isFinite(timestamp) && Number.isFinite(price)).map(([timestamp, price]) => ({ timestamp, price }));
}

export type { ChartPoint, CoinDetail, MarketCoin } from "./types";