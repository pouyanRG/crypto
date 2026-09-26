"use client";

import { useEffect, useMemo, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/market/SearchBar";
import TabsBar from "../../components/market/TabsBar";
import MarketTable from "../../components/market/MarketTable";

const PER_PAGE = 250;
const PAGE_SIZE = 50;
const SORT_FIELDS = {
  rank: "market_cap_rank",
  price: "current_price",
  change_1h: "price_change_percentage_1h_in_currency",
  change_24h: "price_change_percentage_24h",
  change_7d: "price_change_percentage_7d_in_currency",
  volume: "total_volume",
  market_cap: "market_cap",
};

function sortCoins(coins, sort) {
  const sorted = [...coins];
  const field = SORT_FIELDS[sort.key];
  const direction = sort.direction === "asc" ? 1 : -1;
  return sorted.sort((a, b) => {
    const first = a[field];
    const second = b[field];
    if (first == null) return second == null ? 0 : 1;
    if (second == null) return -1;
    return (first - second) * direction;
  });
}

function filterByTab(coins, tab) {
  if (tab === "gainers") {
    return coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0);
  }
  if (tab === "losers") {
    return coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0);
  }
  return coins;
}

export default function MarketPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sort, setSort] = useState({ key: "market_cap", direction: "desc" });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, refetch } = useCoinsMarket({
    page: 1,
    perPage: PER_PAGE,
  });

  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const toggleWatchlist = useAppStore((state) => state.toggleWatchlist);

  const coins = useMemo(() => data ?? [], [data]);

  const visibleCoins = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    let result = coins;

    if (term) {
      result = result.filter(
        (coin) =>
          coin.name?.toLowerCase().includes(term) ||
          coin.symbol?.toLowerCase().includes(term),
      );
    }

    result = filterByTab(result, activeTab);
    return sortCoins(result, sort);
  }, [coins, debouncedSearch, activeTab, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleCoins.length / PAGE_SIZE));
  const paginatedCoins = visibleCoins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    setPage(1);
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Markets</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsBar
          active={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setPage(1);
          }}
        />
      </div>

      <Card as="div" variant="outlined" className="p-0">
        <MarketTable
          coins={paginatedCoins}
          sort={sort}
          onSort={handleSort}
          watchlistedIds={watchlistIds}
          onToggleWatchlist={(coin) => toggleWatchlist(coin.id)}
          loading={isLoading}
          error={isError ? "Could not load market data" : undefined}
          onRetry={refetch}
          emptyMessage={debouncedSearch ? `No coins match "${debouncedSearch}"` : "No market data available"}
        />
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-[var(--color-text-muted)]">Page {page} of {pageCount}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
