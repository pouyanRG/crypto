"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetcher, getExchangeVolumeChartUrl, parseExchangeVolumeChart } from "../api";

export default function useExchangeVolumeChart(id, days = 7) {
  return useQuery({
    queryKey: ["exchange-volume-chart", id, days],
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 300_000,
    queryFn: async ({ signal }) => parseExchangeVolumeChart(await fetcher(getExchangeVolumeChartUrl(id, days), { signal })),
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}
