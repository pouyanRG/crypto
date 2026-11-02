"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetcher, getTrendingUrl, parseTrendingCoins } from "../api";

export default function useTrendingCoins({ enabled = true } = {}) {
  const url = getTrendingUrl();

  return useQuery({
    queryKey: ["trending-coins"],
    queryFn: async ({ signal }) => parseTrendingCoins(await fetcher(url, { signal })),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: (failureCount, error) =>
      failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}
