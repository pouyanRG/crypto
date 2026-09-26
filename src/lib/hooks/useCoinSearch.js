"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getCoinSearchUrl } from "../api";

export default function useCoinSearch(query) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["coin-search", trimmed],
    queryFn: ({ signal }) => fetcher(getCoinSearchUrl(trimmed), { signal }),
    enabled: trimmed.length >= 2,
    staleTime: 60_000,
    select: (data) =>
      (data?.coins ?? []).slice(0, 10).map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        rank: coin.market_cap_rank ?? null,
      })),
  });
}
