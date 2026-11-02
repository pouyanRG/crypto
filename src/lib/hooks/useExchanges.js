"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetcher, getExchangesUrl, parseExchanges } from "../api";

export default function useExchanges({ enabled = true } = {}) {
  const url = getExchangesUrl();

  return useQuery({
    queryKey: ["exchanges"],
    queryFn: async ({ signal }) => parseExchanges(await fetcher(url, { signal })),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: (failureCount, error) =>
      failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}
