"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getCoinChartUrl, normalizeChartData } from "../api";

export default function useCoinChart(id, days = 30, options = {}) {
  const { refreshInterval = 60000 } = options;
  const key = id ? getCoinChartUrl(id, days) : null;
  const query = useQuery({
    queryKey: ["coin-chart", id, days],
    queryFn: ({ signal }) => fetcher(key, { signal }),
    enabled: Boolean(id),
    select: normalizeChartData,
    staleTime: refreshInterval,
    refetchInterval: refreshInterval,
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });

  return query;
}