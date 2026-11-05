"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher, getExchangeDetailUrl, parseExchangeDetail } from "../api";

export default function useExchangeDetail(id) {
  return useQuery({
    queryKey: ["exchange-detail", id],
    queryFn: async ({ signal }) => parseExchangeDetail(await fetcher(getExchangeDetailUrl(id), { signal }), id),
    enabled: Boolean(id),
    staleTime: 300_000,
    retry: (failureCount, error) => failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}
