"use client";

import { useMemo, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import SearchBar from "../../components/market/SearchBar";
import TabsBar from "../../components/market/TabsBar";
import MarketTable from "../../components/market/MarketTable";

const SORT_OPTIONS = [
  { value: "market_cap_desc", label: "Market cap (high to low)" },
  { value: "market_cap_asc", label: "Market cap (low to high)" },
  { value: "price_desc", label: "Price (high to low)" },
  { value: "price_asc", label: "Price (low to high)" },
  { value: "change_24h_desc", label: "24h change (high to low)" },
  { value: "change_24h_asc", label: "24h change (low to high)" },
  { value: "volume_desc", label: "Volume (high to low)" },
];

const PER_PAGE = 50;

function sortCoins(coins, sortKey) {
  const sorted = [...coins];
  switch (sortKey) {
    case "market_cap_asc":
      return sorted.sort((a, b) => (a.market_cap ?? 0) - (b.market_cap ?? 0));
    case "price_desc":
      return sorted.sort((a, b) => (b.current_price ?? 0) - (a.current_price ?? 0));
    case "price_asc":
      return sorted.sort((a, b) => (a.current_price ?? 0) - (b.current_price ?? 0));
    case "change_24h_desc":
      return sorted.sort((a, b) => (b.price_change_percentage_24h ?? -Infinity) - (a.price_change_percentage_24h ?? -Infinity));
    case "change_24h_asc":
      return sorted.sort((a, b) => (a.price_change_percentage_24h ?? Infinity) - (b.price_change_percentage_24h ?? Infinity));
    case "volume_desc":
      return sorted.sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0));
    case "market_cap_desc":
    default:
      return sorted.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
  }
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
  const [activeTab, setActiveTab] = useState("all");
  const [sortKey, setSortKey] = useState("market_cap_desc");

  const { data, isLoading, isError, refetch, isFetching } = useCoinsMarket({
    page,
    perPage: PER_PAGE,
  });

  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const toggleWatchlist = useAppStore((state) => state.toggleWatchlist);

  const coins = data ?? [];

  const visibleCoins = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = coins;

    if (term) {
      result = result.filter(
        (coin) =>
          coin.name?.toLowerCase().includes(term) ||
          coin.symbol?.toLowerCase().includes(term),
      );
    }

    result = filterByTab(result, activeTab);
    return sortCoins(result, sortKey);
  }, [coins, search, activeTab, sortKey]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Markets</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsBar active={activeTab} onChange={setActiveTab} />
        <div className="w-full max-w-xs sm:w-56">
          <Select
            id="market-sort"
            label="Sort by"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card as="div" variant="outlined" className="p-0">
        <MarketTable
          coins={visibleCoins}
          watchlistedIds={watchlistIds}
          onToggleWatchlist={(coin) => toggleWatchlist(coin.id)}
          loading={isLoading}
          error={isError ? "Could not load market data" : undefined}
          onRetry={refetch}
          emptyMessage={search ? `No coins match "${search}"` : "No market data available"}
        />
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1 || isFetching}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-[var(--color-text-muted)]">Page {page}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={isFetching || coins.length < PER_PAGE}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
