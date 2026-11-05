"use client";

import { useQueries } from "@tanstack/react-query";
import { fetcher, getExchangeVolumeChartUrl, parseExchangeVolumeChart } from "../api";

export default function useExchangeVolumeCharts(ids = []) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["exchange-volume-chart", id, 1],
      enabled: Boolean(id),
      staleTime: 300_000,
      retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
      queryFn: async ({ signal }) => parseExchangeVolumeChart(await fetcher(getExchangeVolumeChartUrl(id, 1), { signal })),
    })),
    combine: (results) => ({
      byId: Object.fromEntries(
        results.map((result, index) => [ids[index], {
          points: result.data ?? [],
          isLoading: result.isLoading,
          isError: result.isError,
        }]),
      ),
    }),
  });
}
