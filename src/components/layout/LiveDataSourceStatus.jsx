"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import DataSourceStatus from "./DataSourceStatus";

function resolveStatus({ hasError, hasData, isFetching, isStale }) {
  if (hasError && hasData && !isFetching) return "stale";
  if (hasError && !isFetching) return "unavailable";
  if (isFetching) return hasData ? "updating" : "live";
  if (hasData) return isStale ? "stale" : "cached";
  return "offline";
}

export default function LiveDataSourceStatus() {
  const isFetching = useIsFetching({ queryKey: ["markets"] }) > 0;
  const queryClient = useQueryClient();
  const queries = queryClient.getQueryCache().findAll({ queryKey: ["markets"] });
  const status = resolveStatus({
    hasError: queries.some((query) => Boolean(query.state.error)),
    hasData: queries.some((query) => query.state.data !== undefined),
    isFetching,
    isStale: queries.some((query) => query.isStale()),
  });

  return (
    <>
      <span className="hidden sm:inline-flex"><DataSourceStatus status={status} /></span>
      <span className="inline-flex px-1 sm:hidden"><DataSourceStatus status={status} compact /></span>
    </>
  );
}