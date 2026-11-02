"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetcher, getMarketsUrl } from "../api";

export default function useCoinsMarket(options = {}) {
  const {
    page = 1,
    perPage = 50,
    ids = [],
    sparkline = true,
    refreshInterval = 60000,
    enabled = true,
  } = options;
  const key = getMarketsUrl({ page, perPage, ids, sparkline });

  return useQuery({
    queryKey: ["markets", page, perPage, ids, sparkline],
    queryFn: ({ signal }) => fetcher(key, { signal }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}