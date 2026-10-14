"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import clsx from "clsx";
import { buildCompareChartRows } from "../../lib/compare";
import { fetcher, getCoinChartUrl, normalizeChartData } from "../../lib/api";
import { MARKET_COIN_IDS, STABLE_IDS } from "../../lib/coinAssets";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import Tabs from "../ui/Tabs";
import CompareNormalizedChart from "./CompareNormalizedChart";

const MAX_COINS = 3;
const MIN_COINS = 2;

const RANGE_TABS = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
];

const DEFAULT_SELECTED = ["bitcoin", "ethereum"];

function combineChartQueries(results) {
  return {
    seriesData: results.map((result) => result.data),
    loading: results.some((result) => result.isLoading),
    fetching: results.some((result) => result.isFetching),
    placeholderData: results.some((result) => result.isPlaceholderData),
    errors: results.map((result) => result.isError),
    queryLoading: results.map((result) => result.isLoading),
    queryFetching: results.map((result) => result.isFetching),
    refetch: results.map((result) => result.refetch),
  };
}

export default function CompareClient() {
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED);
  const [limitMsg, setLimitMsg] = useState(false);
  const [days, setDays] = useState(30);

  const { data: marketCoins, isLoading: listLoading } = useCoinsMarket({
    ids: MARKET_COIN_IDS,
    perPage: MARKET_COIN_IDS.length,
  });

  const coinOptions = useMemo(() => {
    const byId = new Map((marketCoins ?? []).map((coin) => [coin.id, coin]));
    return MARKET_COIN_IDS.filter((id) => byId.has(id) && !STABLE_IDS.includes(id)).map((id) => {
      const coin = byId.get(id);
      return { id, label: `${coin.name} (${coin.symbol.toUpperCase()})` };
    });
  }, [marketCoins]);

  const labelById = useMemo(() => {
    const map = {};
    for (const option of coinOptions) {
      map[option.id] = option.label;
    }
    return map;
  }, [coinOptions]);

  const chartQueries = useQueries({
    queries: selectedIds.map((id) => ({
      queryKey: ["coin-chart", id, days],
      queryFn: ({ signal }) => fetcher(getCoinChartUrl(id, days), { signal }),
      enabled: selectedIds.length >= MIN_COINS && Boolean(id),
      select: normalizeChartData,
      placeholderData: keepPreviousData,
      staleTime: 60_000,
      retry: (failureCount, error) =>
        failureCount < 2 && (error?.status === 429 || error?.status >= 500),
    })),
    combine: combineChartQueries,
  });

  const seriesMeta = useMemo(
    () =>
      selectedIds.map((id, index) => ({
        id,
        label: labelById[id] ?? id,
        points: chartQueries.seriesData[index] ?? [],
      })),
    [selectedIds, labelById, chartQueries.seriesData],
  );

  const rawChartResult = useMemo(() => buildCompareChartRows(seriesMeta), [seriesMeta]);
  const unavailableIds = useMemo(
    () =>
      selectedIds.filter((id, index) => (
        chartQueries.errors[index] ||
        (
          rawChartResult.skippedIds.includes(id) &&
          !chartQueries.queryLoading[index] &&
          !chartQueries.queryFetching[index]
        )
      )),
    [
      selectedIds,
      chartQueries.errors,
      chartQueries.queryLoading,
      chartQueries.queryFetching,
      rawChartResult.skippedIds,
    ],
  );
  const availableSeries = useMemo(
    () => seriesMeta.filter(({ id }) => !unavailableIds.includes(id)),
    [seriesMeta, unavailableIds],
  );
  const chartResult = useMemo(() => buildCompareChartRows(availableSeries), [availableSeries]);
  const hasChartToRender = availableSeries.length >= MIN_COINS && chartResult.rows.length >= 2;
  const chartIsUpdating = chartQueries.fetching || chartQueries.placeholderData;
  const initialChartLoading = selectedIds.length >= MIN_COINS && chartQueries.loading && !hasChartToRender;

  const handleSelectionToggle = (id) => {
    if (selectedIds.includes(id)) {
      setLimitMsg(false);
      setSelectedIds((previous) => previous.filter((selectedId) => selectedId !== id));
      return;
    }
    if (selectedIds.length >= MAX_COINS) {
      setLimitMsg(true);
      return;
    }
    setLimitMsg(false);
    setSelectedIds((previous) =>
      previous.includes(id) || previous.length >= MAX_COINS ? previous : [...previous, id],
    );
  };
  const chartEmptyMessage = selectedIds.length < MIN_COINS
    ? "Select at least two coins to compare."
    : "There is not enough data to compare this range.";

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Compare</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Overlay up to three coins on a normalized index chart (start = 100).
        </p>
      </div>

      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-1.5">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Coins (select {MIN_COINS}–{MAX_COINS})
            </p>
            {listLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <div
                id="compare-coin-select"
                role="group"
                aria-label="Coins to compare"
                aria-describedby="compare-coin-help"
                className="flex flex-wrap gap-2"
              >
                {coinOptions.map((option) => {
                  const checked = selectedIds.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={clsx(
                        "flex min-h-9 min-w-0 max-w-full cursor-pointer items-center rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent-muted)]",
                        checked
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => handleSelectionToggle(option.id)}
                      />
                      <span className="truncate">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
            <p id="compare-coin-help" className="text-xs text-[var(--color-text-secondary)]">
              Select up to {MAX_COINS} coins. Duplicates are ignored.
            </p>
            {limitMsg && (
              <p role="alert" className="text-xs text-[var(--color-down)]">
                You can compare up to {MAX_COINS} coins at a time.
              </p>
            )}
          </div>

          <Tabs
            id="compare-range"
            ariaLabel="Chart range"
            tabs={RANGE_TABS}
            active={String(days)}
            onChange={(value) => setDays(Number(value))}
            activationMode="automatic"
          />
        </div>
      </Card>

      <Card as="section" aria-label="Normalized price comparison">
        <h2 className="mb-4 text-base font-semibold text-[var(--color-text-primary)]">
          Normalized performance
        </h2>

        {selectedIds.length < MIN_COINS ? (
          <CompareNormalizedChart data={[]} series={[]} days={days} emptyMessage={chartEmptyMessage} />
        ) : initialChartLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <>
            {unavailableIds.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2" role="status" aria-label="Unavailable coin price data">
                {unavailableIds.map((id) => {
                  const index = selectedIds.indexOf(id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-down)]/30 bg-[var(--color-down-muted)] px-3 py-1 text-xs text-[var(--color-down)]"
                    >
                      {labelById[id] ?? id} data unavailable
                      <button
                        type="button"
                        className="font-semibold underline underline-offset-2"
                        onClick={() => chartQueries.refetch[index]()}
                      >
                        Retry
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            {availableSeries.length < MIN_COINS ? (
              <ErrorState
                title="Not enough valid price histories"
                description="At least two coins need valid price data to compare this range."
                onRetry={() => unavailableIds.forEach((id) => chartQueries.refetch[selectedIds.indexOf(id)]())}
              />
            ) : (
              <div className={chartIsUpdating ? "opacity-60 transition-opacity" : undefined}>
                <CompareNormalizedChart
                  data={chartResult.rows}
                  series={availableSeries.map(({ id, label }) => ({ id, label }))}
                  days={days}
                  emptyMessage={chartEmptyMessage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </section>
  );
}
