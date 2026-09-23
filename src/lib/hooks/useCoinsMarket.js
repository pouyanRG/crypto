"use client";

import useSWR from "swr";
import { fetcher, getMarketsUrl } from "../api";

export default function useCoinsMarket(options = {}) {
  const { page = 1, perPage = 50, ids = [], refreshInterval = 60000 } = options;
  const key = getMarketsUrl({ page, perPage, ids });
  return useSWR(key, fetcher, { refreshInterval, keepPreviousData: true });
}