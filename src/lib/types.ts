export type Theme = "dark" | "light";

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  total_volume: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: {
    price: number[];
  } | null;
}

export interface CoinMarketData {
  current_price?: Record<string, number>;
  market_cap?: Record<string, number>;
  total_volume?: Record<string, number>;
  market_cap_rank?: number;
  price_change_percentage_24h?: number;
  ath?: Record<string, number>;
  atl?: Record<string, number>;
  circulating_supply?: number;
  total_supply?: number | null;
  max_supply?: number | null;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image?: {
    thumb?: string;
    small?: string;
    large?: string;
  };
  description?: Record<string, string>;
  market_data?: CoinMarketData;
}

export interface ChartPoint {
  timestamp: number;
  price: number;
}

export interface ChartResponse {
  prices?: [number, number][];
}


export interface WatchlistState {
  ids: string[];
}

export interface PortfolioAsset {
  id: string;
  amount: number;
  buyPrice: number;
  purchasedAt?: string;
}

export function isMarketCoin(value: unknown): value is MarketCoin {
  if (!value || typeof value !== "object") return false;
  const coin = value as Partial<MarketCoin>;
  return typeof coin.id === "string" && typeof coin.symbol === "string" && typeof coin.name === "string";
}

export function isChartResponse(value: unknown): value is ChartResponse {
  if (!value || typeof value !== "object") return false;
  const prices = (value as ChartResponse).prices;
  return prices === undefined || (Array.isArray(prices) && prices.every((point) => Array.isArray(point) && point.length === 2));
}
