"use client";

import useSWR from "swr";
import { fetcher, getCoinDetailUrl } from "../api";

export default function useCoinDetail(id, options = {}) {
  const { refreshInterval = 60000 } = options;
  return useSWR(id ? getCoinDetailUrl(id) : null, fetcher, { refreshInterval });
}