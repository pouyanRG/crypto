"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetcher, parseDefiChains, parseDefiProtocols } from "../api";

function useDefiDataset(dataset, parser, enabled) {
  return useQuery({
    queryKey: ["defillama", dataset],
    queryFn: async ({ signal }) =>
      parser(await fetcher(`/api/defillama/${dataset}`, { signal })),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 300_000,
    refetchInterval: 300_000,
    retry: (failureCount, error) =>
      failureCount < 2 && (error?.status === 429 || error?.status >= 500),
  });
}

export function useDefiProtocols({ enabled = true } = {}) {
  return useDefiDataset("protocols", parseDefiProtocols, enabled);
}

export function useDefiChains({ enabled = true } = {}) {
  return useDefiDataset("chains", parseDefiChains, enabled);
}
