"use client";

import { useState } from "react";
import Link from "next/link";
import useCoinDetail from "../../lib/hooks/useCoinDetail";
import useCoinChart from "../../lib/hooks/useCoinChart";
import { useAppStore } from "../../lib/store/useAppStore";
import NavIcon from "../layout/NavIcon";
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

function CoinBreadcrumb({ label }) {
  return (
    <nav className="page-context" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <li>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-2 text-[var(--color-text-secondary)] transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--color-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <NavIcon name="dashboard" className="size-4" />
            Dashboard
          </Link>
        </li>
        <li className="flex items-center gap-1">
          <svg
            aria-hidden="true"
            className="size-3.5 text-[var(--color-text-muted)]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 3 5 5-5 5" />
          </svg>
          <Link
            href="/market"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-2 text-[var(--color-text-secondary)] transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:text-[var(--color-accent-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            Markets
          </Link>
        </li>
        <li className="flex min-w-0 items-center gap-1">
          <svg
            aria-hidden="true"
            className="size-3.5 shrink-0 text-[var(--color-text-muted)]"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 3 5 5-5 5" />
          </svg>
          <span
            aria-current="page"
            className="inline-flex min-h-11 max-w-[12rem] items-center truncate px-2 text-[var(--color-text-primary)]"
          >
            {label}
          </span>
        </li>
      </ol>
    </nav>
  );
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
      <section className="space-y-6 md:space-y-8">
        <CoinBreadcrumb label={label || id} />
        <ErrorState
          title="Coin unavailable"
          description={`We could not load details for "${id}". It may be invalid or temporarily unavailable.`}
          onRetry={refetch}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6 md:space-y-8">
      <CoinBreadcrumb label={label || id} />

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
