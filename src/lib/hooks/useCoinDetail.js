"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getCoinDetailUrl } from "../api";

export default function useCoinDetail(id, options = {}) {
  const { refreshInterval = 60000 } = options;
  const key = id ? getCoinDetailUrl(id) : null;

  return useQuery({
    queryKey: ["coin-detail", id],
    queryFn: ({ signal }) => fetcher(key, { signal }),
    enabled: Boolean(id),
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}