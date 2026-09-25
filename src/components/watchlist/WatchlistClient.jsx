"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import MarketTable from "../market/MarketTable";
import Button from "../ui/Button";

export default function WatchlistClient() {
  const router = useRouter();
  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const toggleWatchlist = useAppStore((state) => state.toggleWatchlist);
  const [sort, setSort] = useState({ key: "market_cap", direction: "desc" });

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCoinsMarket({
    ids: watchlistIds,
    perPage: Math.max(watchlistIds.length, 1),
    enabled: watchlistIds.length > 0,
  });

  const coins = useMemo(() => {
    const list = data ?? [];
    const fieldMap = {
      rank: "market_cap_rank",
      price: "current_price",
      change_1h: "price_change_percentage_1h_in_currency",
      change_24h: "price_change_percentage_24h",
      change_7d: "price_change_percentage_7d_in_currency",
      volume: "total_volume",
      market_cap: "market_cap",
    };
    const field = fieldMap[sort.key] ?? "market_cap";
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const first = a[field];
      const second = b[field];
      if (first == null) return second == null ? 0 : 1;
      if (second == null) return -1;
      return (first - second) * direction;
    });
  }, [data, sort]);

  const handleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  if (watchlistIds.length === 0) {
    return (
      <section className="space-y-5">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Watchlist</h1>
        <EmptyState
          title="Your watchlist is empty"
          description="Star coins from Markets to track them here. Data stays in this browser."
          actionLabel="Browse markets"
          onAction={() => router.push("/market")}
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            Or go to{" "}
            <Link href="/market" className="text-[var(--color-accent)] underline-offset-2 hover:underline">
              /market
            </Link>
          </p>
        </EmptyState>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Watchlist</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {isError ? (
        <ErrorState
          title="Watchlist unavailable"
          description="We could not load prices for your starred coins."
          onRetry={refetch}
        />
      ) : (
        <Card as="div" variant="outlined" className="p-0">
          <MarketTable
            coins={coins}
            sort={sort}
            onSort={handleSort}
            watchlistedIds={watchlistIds}
            onToggleWatchlist={(coin) => toggleWatchlist(coin.id)}
            loading={isLoading}
            emptyMessage="No market data for your watchlist yet"
          />
        </Card>
      )}
    </section>
  );
}
