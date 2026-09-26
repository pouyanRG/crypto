"use client";

import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import clsx from "clsx";
import { buildCompareChartRows } from "../../lib/compare";
import { fetcher, getCoinChartUrl, normalizeChartData } from "../../lib/api";
import { MARKET_COIN_IDS } from "../../lib/coinAssets";
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
    return MARKET_COIN_IDS.map((id) => {
      const coin = byId.get(id);
      return {
        id,
        label: coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : id,
      };
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
      staleTime: 60_000,
      retry: (failureCount, error) =>
        failureCount < 2 && (error?.status === 429 || error?.status >= 500),
    })),
  });

  const seriesMeta = useMemo(
    () =>
      selectedIds.map((id, index) => ({
        id,
        label: labelById[id] ?? id,
        points: chartQueries[index]?.data ?? [],
      })),
    [selectedIds, labelById, chartQueries],
  );

  const chartRows = useMemo(() => buildCompareChartRows(seriesMeta), [seriesMeta]);

  const anyChartLoading =
    selectedIds.length >= MIN_COINS && chartQueries.some((query) => query.isLoading);
  const chartErrors = chartQueries.filter((query) => query.isError);

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
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {coinOptions.map((option) => {
                  const checked = selectedIds.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={clsx(
                        "flex min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-[var(--color-accent-muted)]",
                        checked
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)]",
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
          <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
            Pick at least two coins to draw the chart.
          </div>
        ) : chartErrors.length > 0 ? (
          <ErrorState
            title="Could not load chart data"
            description="One or more price histories failed to load. Try again in a moment."
            onRetry={() => chartQueries.forEach((query) => query.refetch())}
          />
        ) : anyChartLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <CompareNormalizedChart
            data={chartRows}
            series={seriesMeta.map(({ id, label }) => ({ id, label }))}
          />
        )}
      </Card>
    </section>
  );
}
