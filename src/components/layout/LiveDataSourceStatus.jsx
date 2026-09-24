"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import DataSourceStatus from "./DataSourceStatus";

export default function LiveDataSourceStatus() {
  const isFetching = useIsFetching({ queryKey: ["markets"] });
  const queryClient = useQueryClient();
  const marketQueries = queryClient.getQueryCache().findAll({ queryKey: ["markets"] });
  const hasError = marketQueries.some((query) => Boolean(query.state.error));
  const hasData = marketQueries.some((query) => query.state.data !== undefined);

  if (hasError && hasData && !isFetching) return <DataSourceStatus status="stale" />;
  if (hasError && !isFetching) return <DataSourceStatus status="unavailable" />;
  if (isFetching) return <DataSourceStatus status={hasData ? "updating" : "live"} />;
  if (hasData) return <DataSourceStatus status={marketQueries.some((query) => query.isStale()) ? "stale" : "cached"} />;
  return <DataSourceStatus status="offline" />;
}