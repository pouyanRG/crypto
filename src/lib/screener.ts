import type { MarketCoin } from "./types";

export interface ScreenerFilters {
  query: string;
  minMarketCap: string;
  maxMarketCap: string;
  minVolume: string;
  minChange: string;
  maxChange: string;
  sortBy: "market_cap" | "volume" | "change_desc" | "change_asc";
}

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function filterAndSortCoins(
  coins: readonly MarketCoin[],
  filters: ScreenerFilters,
): MarketCoin[] {
  const query = filters.query.trim().toLowerCase();
  const minMarketCap = parseOptionalNumber(filters.minMarketCap);
  const maxMarketCap = parseOptionalNumber(filters.maxMarketCap);
  const minVolume = parseOptionalNumber(filters.minVolume);
  const minChange = parseOptionalNumber(filters.minChange);
  const maxChange = parseOptionalNumber(filters.maxChange);

  const filtered = coins.filter((coin) => {
    const change = coin.price_change_percentage_24h;
    if (
      query &&
      !coin.name.toLowerCase().includes(query) &&
      !coin.symbol.toLowerCase().includes(query)
    ) {
      return false;
    }
    if (minMarketCap != null && (coin.market_cap == null || coin.market_cap < minMarketCap)) {
      return false;
    }
    if (maxMarketCap != null && (coin.market_cap == null || coin.market_cap > maxMarketCap)) {
      return false;
    }
    if (minVolume != null && (coin.total_volume == null || coin.total_volume < minVolume)) {
      return false;
    }
    if (minChange != null && (change == null || change < minChange)) return false;
    if (maxChange != null && (change == null || change > maxChange)) return false;
    return true;
  });

  const compareNullableNumbers = (first: number | null | undefined, second: number | null | undefined, direction: "asc" | "desc") => {
    if (first == null) return second == null ? 0 : 1;
    if (second == null) return -1;
    return direction === "asc" ? first - second : second - first;
  };

  return filtered.sort((a, b) => {
    if (filters.sortBy === "volume") {
      return compareNullableNumbers(a.total_volume, b.total_volume, "desc");
    }
    if (filters.sortBy === "change_desc" || filters.sortBy === "change_asc") {
      return compareNullableNumbers(
        a.price_change_percentage_24h,
        b.price_change_percentage_24h,
        filters.sortBy === "change_asc" ? "asc" : "desc",
      );
    }
    return compareNullableNumbers(a.market_cap, b.market_cap, "desc");
  });
}
