"use client";

import { useState } from "react";
import Link from "next/link";
import useCoinDetail from "../../lib/hooks/useCoinDetail";
import useCoinChart from "../../lib/hooks/useCoinChart";
import { useAppStore } from "../../lib/store/useAppStore";
import CoinHeader from "./CoinHeader";
import CoinChart from "./CoinChart";
import CoinStats from "./CoinStats";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";

const RANGE_TO_DAYS = {
  "24h": 1,
  "7d": 7,
  "30d": 30,
  "1y": 365,
};

const DAYS_TO_RANGE = {
  1: "24h",
  7: "7d",
  30: "30d",
  365: "1y",
};

function formatCoinLabel(id) {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function CoinDetailClient({ id }) {
  const [days, setDays] = useState(1);
  const range = DAYS_TO_RANGE[days] ?? "24h";

  const {
    data: coin,
    isLoading,
    isError,
    refetch,
  } = useCoinDetail(id);

  const {
    data: chartData = [],
    isLoading: chartLoading,
    isError: chartError,
    refetch: refetchChart,
  } = useCoinChart(id, days);

  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const toggleWatchlist = useAppStore((state) => state.toggleWatchlist);
  const isWatchlisted = Boolean(id && watchlistIds.includes(id));

  const handleRangeChange = (nextRange) => {
    setDays(RANGE_TO_DAYS[nextRange] ?? 1);
  };

  const label = coin?.name ?? formatCoinLabel(id ?? "");

  if (isError) {
    return (
      <section className="space-y-5">
        <nav className="page-context" aria-label="Breadcrumb">
          <Link href="/">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <Link href="/market">Markets</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{label || id}</span>
        </nav>
        <ErrorState
          title="Coin unavailable"
          description={`We could not load details for "${id}". It may be invalid or temporarily unavailable.`}
          onRetry={refetch}
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <nav className="page-context" aria-label="Breadcrumb">
        <Link href="/">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/market">Markets</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{label || id}</span>
      </nav>

      {isLoading || !coin ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading coin details">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : (
        <>
          <CoinHeader
            coin={coin}
            isWatchlisted={isWatchlisted}
            onToggleWatchlist={() => toggleWatchlist(coin.id)}
          />

          {chartError ? (
            <ErrorState
              title="Chart unavailable"
              description="Could not load price history for this coin."
              onRetry={refetchChart}
            />
          ) : (
            <div className="relative">
              {chartLoading && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-surface)]/60"
                  aria-live="polite"
                >
                  <Skeleton className="h-8 w-32" />
                </div>
              )}
              <CoinChart
                data={chartData}
                range={range}
                onRangeChange={handleRangeChange}
                title={`${coin.name} price history`}
              />
            </div>
          )}

          <CoinStats coin={coin} />
        </>
      )}
    </section>
  );
}
