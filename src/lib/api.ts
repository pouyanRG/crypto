import type {
  ChartPoint,
  ChartResponse,
  CoinDetail,
  DefiChain,
  DefiProtocol,
  Exchange,
  ExchangeDetail,
  MarketCoin,
  TrendingCoin,
  VolumePoint,
} from "./types";

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
  sparkline?: boolean;
}

export function getMarketsUrl({
  page = 1,
  perPage = 50,
  ids = [],
  sparkline = true,
}: MarketsQuery = {}): string {
  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: String(sparkline),
    price_change_percentage: "1h,7d",
  });
  if (ids.length > 0) params.set("ids", ids.join(","));
  return `${API_BASE_URL}/coins/markets?${params}`;
}

export function getCoinDetailUrl(id: string): string {
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`;
}

export function getCoinChartUrl(id: string, days = 30): string {
  const params = new URLSearchParams({ vs_currency: "usd", days: String(days) });
  if (days > 90) params.set("interval", "daily");
  return `${API_BASE_URL}/coins/${encodeURIComponent(id)}/market_chart?${params}`;
}

export function getCoinSearchUrl(query: string): string {
  const params = new URLSearchParams({ query });
  return `${API_BASE_URL}/search?${params}`;
}

export function getExchangesUrl(perPage = 100, page = 1): string {
  const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
  return `${API_BASE_URL}/exchanges?${params}`;
}

export function getExchangeDetailUrl(id: string): string {
  return `${API_BASE_URL}/exchanges/${encodeURIComponent(id)}`;
}

export function getExchangeVolumeChartUrl(id: string, days = 1): string {
  return `${API_BASE_URL}/exchanges/${encodeURIComponent(id)}/volume_chart?days=${days}`;
}

export function getTrendingUrl(): string {
  return `${API_BASE_URL}/search/trending`;
}

export function parseExchangeVolumeChart(value: unknown): VolumePoint[] {
  if (!Array.isArray(value)) {
    throw new Error("CoinGecko returned an invalid volume chart.");
  }

  return value.flatMap((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const timestampValue = Number(entry[0]);
    const numericValue = Number(entry[1]);
    if (!Number.isFinite(timestampValue) || !Number.isFinite(numericValue)) return [];
    return [{ timestamp: timestampValue, value: numericValue }];
  });
}

export function parseExchangeDetail(value: unknown, id: string): ExchangeDetail {
  if (!isRecord(value) || typeof value.name !== "string" || !Number.isFinite(Number(value.trade_volume_24h_btc))) {
    throw new Error("CoinGecko returned malformed exchange data.");
  }

  return {
    id,
    name: value.name,
    ...(typeof value.image === "string" ? { image: value.image } : {}),
    ...(value.country !== undefined ? { country: typeof value.country === "string" ? value.country : null } : {}),
    ...(value.year_established !== undefined ? { year_established: typeof value.year_established === "number" && Number.isFinite(value.year_established) ? value.year_established : null } : {}),
    ...(value.description !== undefined ? { description: typeof value.description === "string" ? value.description : value.description == null ? null : String(value.description) } : {}),
    ...(value.url !== undefined ? { url: typeof value.url === "string" ? value.url : value.url == null ? null : String(value.url) } : {}),
    trust_score: typeof value.trust_score === "number" && Number.isFinite(value.trust_score) ? value.trust_score : value.trust_score == null ? null : Number(value.trust_score),
    trust_score_rank: typeof value.trust_score_rank === "number" && Number.isFinite(value.trust_score_rank) ? value.trust_score_rank : value.trust_score_rank == null ? null : Number(value.trust_score_rank),
    trade_volume_24h_btc: Number(value.trade_volume_24h_btc),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableFiniteNumber(value: unknown): value is number | null | undefined {
  return value == null || (typeof value === "number" && Number.isFinite(value));
}

export function parseExchanges(value: unknown): Exchange[] {
  if (!Array.isArray(value)) {
    throw new Error("CoinGecko returned an invalid exchange list.");
  }

  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.id !== "string" ||
      typeof entry.name !== "string" ||
      typeof entry.trade_volume_24h_btc !== "number" ||
      !Number.isFinite(entry.trade_volume_24h_btc) ||
      (entry.image != null && typeof entry.image !== "string") ||
      (entry.country != null && typeof entry.country !== "string") ||
      !isNullableFiniteNumber(entry.trust_score) ||
      !isNullableFiniteNumber(entry.trust_score_rank)
    ) {
      throw new Error("CoinGecko returned malformed exchange data.");
    }

    return {
      id: entry.id,
      name: entry.name,
      image: entry.image as string | undefined,
      country: entry.country as string | null | undefined,
      trust_score: entry.trust_score as number | null | undefined,
      trust_score_rank: entry.trust_score_rank as number | null | undefined,
      trade_volume_24h_btc: entry.trade_volume_24h_btc,
    };
  });
}

export function parseTrendingCoins(value: unknown): TrendingCoin[] {
  if (!isRecord(value) || !Array.isArray(value.coins)) {
    throw new Error("CoinGecko returned an invalid trending response.");
  }

  return value.coins.map((entry) => {
    if (!isRecord(entry) || !isRecord(entry.item)) {
      throw new Error("CoinGecko returned malformed trending coin data.");
    }

    const item = entry.item;
    const data = isRecord(item.data) ? item.data : {};
    const priceChange = isRecord(data.price_change_percentage_24h)
      ? data.price_change_percentage_24h.usd
      : undefined;

    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.symbol !== "string" ||
      (item.thumb != null && typeof item.thumb !== "string") ||
      !isNullableFiniteNumber(item.market_cap_rank) ||
      !isNullableFiniteNumber(item.score) ||
      !isNullableFiniteNumber(data.price) ||
      !isNullableFiniteNumber(priceChange)
    ) {
      throw new Error("CoinGecko returned malformed trending coin data.");
    }

    return {
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      thumb: item.thumb as string | undefined,
      market_cap_rank: item.market_cap_rank as number | null | undefined,
      score: item.score as number | null | undefined,
      price: data.price as number | null | undefined,
      price_change_percentage_24h: priceChange as number | null | undefined,
    };
  });
}

export function parseDefiProtocols(value: unknown): DefiProtocol[] {
  if (!Array.isArray(value)) {
    throw new Error("DeFiLlama returned an invalid protocol list.");
  }

  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      (typeof entry.id !== "string" && typeof entry.id !== "number") ||
      typeof entry.name !== "string" ||
      !Array.isArray(entry.chains) ||
      !entry.chains.every((chain) => typeof chain === "string") ||
      typeof entry.tvl !== "number" ||
      !Number.isFinite(entry.tvl) ||
      (entry.symbol != null && typeof entry.symbol !== "string") ||
      (entry.category != null && typeof entry.category !== "string") ||
      !isNullableFiniteNumber(entry.change_1d) ||
      !isNullableFiniteNumber(entry.change_7d)
    ) {
      throw new Error("DeFiLlama returned malformed protocol data.");
    }

    return {
      id: String(entry.id),
      name: entry.name,
      symbol: entry.symbol as string | undefined,
      category: entry.category as string | undefined,
      chains: entry.chains as string[],
      tvl: entry.tvl,
      change_1d: entry.change_1d as number | null | undefined,
      change_7d: entry.change_7d as number | null | undefined,
    };
  });
}

export function parseDefiChains(value: unknown): DefiChain[] {
  if (!Array.isArray(value)) {
    throw new Error("DeFiLlama returned an invalid chain list.");
  }

  return value.map((entry) => {
    if (
      !isRecord(entry) ||
      typeof entry.name !== "string" ||
      typeof entry.tvl !== "number" ||
      !Number.isFinite(entry.tvl) ||
      (entry.tokenSymbol != null && typeof entry.tokenSymbol !== "string") ||
      !isNullableFiniteNumber(entry.chainId)
    ) {
      throw new Error("DeFiLlama returned malformed chain data.");
    }

    return {
      name: entry.name,
      tvl: entry.tvl,
      tokenSymbol: entry.tokenSymbol as string | undefined,
      chainId: entry.chainId as number | null | undefined,
    };
  });
}

export function normalizeChartData(chart: ChartResponse | undefined): ChartPoint[] {
  return (chart?.prices ?? []).filter(([timestamp, price]) => Number.isFinite(timestamp) && Number.isFinite(price)).map(([timestamp, price]) => ({ timestamp, price }));
}

export function normalizeGlobalSeries(series: [number, number][] | undefined): ChartPoint[] {
  return (series ?? []).filter(([timestamp, value]) => Number.isFinite(timestamp) && Number.isFinite(value)).map(([timestamp, value]) => ({ timestamp, price: value }));
}

export type {
  ChartPoint,
  CoinDetail,
  DefiChain,
  DefiProtocol,
  Exchange,
  ExchangeDetail,
  MarketCoin,
  TrendingCoin,
  VolumePoint,
} from "./types";