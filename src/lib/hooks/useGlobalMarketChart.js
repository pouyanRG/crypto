"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getGlobalMarketChartUrl } from "../api";

export default function useGlobalMarketChart(days = 30, options = {}) {
  const { refreshInterval = 60000 } = options;
  const key = getGlobalMarketChartUrl(days);

  return useQuery({
    queryKey: ["global-market-chart", days],
    queryFn: ({ signal }) => fetcher(key, { signal }),
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}