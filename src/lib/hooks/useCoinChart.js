"use client";

import useSWR from "swr";
import { fetcher, getCoinChartUrl, normalizeChartData } from "../api";

export default function useCoinChart(id, days = 30, options = {}) {
  const { refreshInterval = 60000 } = options;
  const swr = useSWR(id ? getCoinChartUrl(id, days) : null, fetcher, { refreshInterval });
  return { ...swr, data: swr.data ? normalizeChartData(swr.data) : undefined };
}