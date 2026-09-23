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
  };
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
