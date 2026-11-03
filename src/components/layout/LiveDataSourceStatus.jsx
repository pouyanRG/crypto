"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import DataSourceStatus from "./DataSourceStatus";
import { getMarketDataFreshness, isMarketDataStale } from "../../lib/marketFreshness";

export default function LiveDataSourceStatus() {
  const isFetching = useIsFetching({ queryKey: ["markets"] }) > 0;
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().findAll({ queryKey: ["markets"] });
  const latest = queries
    .filter((query) => query.state.data !== undefined)
    .map((query) => ({
      query,
      freshness: getMarketDataFreshness(query.state.data, query.state.dataUpdatedAt),
    }))
    .sort((a, b) => (b.freshness?.timestamp ?? 0) - (a.freshness?.timestamp ?? 0))[0];
  const hasData = Boolean(latest);
  const hasError = latest
    ? Boolean(latest.query.state.error)
    : queries.some((query) => Boolean(query.state.error));
  const status = !hasData
    ? isFetching ? "updating" : hasError ? "unavailable" : "waiting"
    : hasError
      ? "stale"
      : isFetching
        ? "updating"
        : isMarketDataStale(latest.freshness?.timestamp) ? "stale"
          : latest.freshness?.source === "provider" ? "live" : "cached";

  return (
    <>
      <span className="hidden lg:inline-flex">
        <DataSourceStatus
          status={status}
          lastUpdatedAt={latest?.freshness?.timestamp}
          timestampSource={latest?.freshness?.source}
        />
      </span>
      <span className="inline-flex px-1 lg:hidden">
        <DataSourceStatus
          status={status}
          compact
          lastUpdatedAt={latest?.freshness?.timestamp}
          timestampSource={latest?.freshness?.source}
        />
      </span>
    </>
  );
}