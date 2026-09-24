"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getCoinChartUrl } from "../api";

export default function useCoinVolume(id, days = 7) {
  return useQuery({
    queryKey: ["coin-volume", id, days],
    queryFn: ({ signal }) => fetcher(getCoinChartUrl(id, days), { signal }),
    select: (data) => (data?.total_volumes ?? []).map(([, value]) => ({ value })),
    enabled: Boolean(id),
    staleTime: 60000,
  });
}