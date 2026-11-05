import type { Exchange } from "./types";

export type TrustTier = "high" | "medium" | "low" | "none";

export interface ExchangeFilters {
  query: string;
  country: string;
  rating: "all" | "high" | "medium" | "low";
  sortBy: "volume" | "trust" | "name";
}

export function getTrustTier(score: number | null | undefined): TrustTier {
  if (score == null || !Number.isFinite(score)) return "none";
  if (score >= 9) return "high";
  if (score >= 6) return "medium";
  return "low";
}

export function trustTierVariant(tier: TrustTier): "up" | "neutral" | "warning" {
  switch (tier) {
    case "high":
      return "up";
    case "medium":
      return "neutral";
    case "low":
      return "warning";
    default:
      return "neutral";
  }
}

export function computeVolumeChange(points: Array<{ timestamp: number; value: number }>): number | null {
  if (!Array.isArray(points) || points.length < 2) return null;
  const first = points[0]?.value;
  const last = points[points.length - 1]?.value;
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) return null;
  return ((last - first) / first) * 100;
}

export function filterAndSortExchanges(
  exchanges: readonly Exchange[],
  filters: ExchangeFilters,
): Exchange[] {
  const query = filters.query.trim().toLowerCase();

  const filtered = exchanges.filter((exchange) => {
    const name = exchange.name ?? "";
    const country = exchange.country ?? "";
    const matchesQuery =
      !query ||
      name.toLowerCase().includes(query) ||
      country.toLowerCase().includes(query);
    const matchesCountry = !filters.country || country === filters.country;
    const tier = getTrustTier(exchange.trust_score);
    const matchesRating =
      filters.rating === "all" ||
      (filters.rating === "high" && tier === "high") ||
      (filters.rating === "medium" && tier === "medium") ||
      (filters.rating === "low" && tier === "low");

    return matchesQuery && matchesCountry && matchesRating;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filters.sortBy) {
      case "trust": {
        const left = a.trust_score ?? Number.NEGATIVE_INFINITY;
        const right = b.trust_score ?? Number.NEGATIVE_INFINITY;
        if (left === right) return String(a.name).localeCompare(String(b.name));
        return right - left;
      }
      case "name":
        return String(a.name).localeCompare(String(b.name));
      case "volume":
      default:
        return Number(b.trade_volume_24h_btc) - Number(a.trade_volume_24h_btc);
    }
  });

  return sorted;
}

export function getCountryOptions(exchanges: readonly Exchange[]): string[] {
  const unique = new Set<string>();
  for (const exchange of exchanges) {
    if (exchange.country && exchange.country.trim()) unique.add(exchange.country.trim());
  }
  return [...unique].sort((a, b) => a.localeCompare(b));
}

const COUNTRY_ISO_MAP: Record<string, string> = {
  "cayman islands": "ky",
  "united states": "us",
  "british virgin islands": "vg",
  "seychelles": "sc",
  "united arab emirates": "ae",
  "hong kong": "hk",
  "singapore": "sg",
  "japan": "jp",
  "south korea": "kr",
  "korea, republic of": "kr",
  "malta": "mt",
  "lithuania": "lt",
  "estonia": "ee",
  "germany": "de",
  "united kingdom": "gb",
  "canada": "ca",
  "australia": "au",
  "bermuda": "bm",
  "panama": "pa",
  "turkey": "tr",
  "china": "cn",
  "india": "in",
  "thailand": "th",
  "indonesia": "id",
  "brazil": "br",
  "mexico": "mx",
  "argentina": "ar",
  "switzerland": "ch",
  "gibraltar": "gi",
  "mauritius": "mu",
  "belize": "bz",
  "bahamas": "bs",
  "philippines": "ph",
  "vietnam": "vn",
  "poland": "pl",
  "ukraine": "ua",
  "russia": "ru",
  "france": "fr",
  "netherlands": "nl",
  "spain": "es",
  "italy": "it",
  "ireland": "ie",
  "luxembourg": "lu",
  "czech republic": "cz",
  "nigeria": "ng",
  "south africa": "za",
  "saint vincent and the grenadines": "vc",
  "marshall islands": "mh",
  "samoa": "ws",
  "cyprus": "cy",
  "bulgaria": "bg",
  "georgia": "ge",
};

export function getCountryIso(country: string | null | undefined): string | null {
  if (!country || !country.trim()) return null;
  return COUNTRY_ISO_MAP[country.trim().toLowerCase()] ?? null;
}
