"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Select from "../ui/Select";
import SearchBar from "./SearchBar";
import TabsBar from "./TabsBar";
import MarketTable from "./MarketTable";

const PER_PAGE = 100;
const PAGE_SIZE = 50;
const TABS = ["all", "gainers", "losers"];
const DEFAULTS = { tab: "all", sort: "market_cap", dir: "desc", page: "1", q: "" };
const SORT_OPTIONS = [
  ["market_cap:desc", "Market cap ↓"],
  ["price:desc", "Price ↓"],
  ["change_24h:desc", "24h change ↓"],
  ["change_24h:asc", "24h change ↑"],
  ["volume:desc", "Volume ↓"],
];
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
  const field = SORT_FIELDS[sort.key];
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...coins].sort((a, b) => {
    const first = a[field];
    const second = b[field];
    if (first == null) return second == null ? 0 : 1;
    if (second == null) return -1;
    return (first - second) * direction;
  });
}

function filterByTab(coins, tab) {
  if (tab === "gainers") return coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0);
  if (tab === "losers") return coins.filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0);
  return coins;
}

function useMarketUrlState() {
  const pathname = usePathname();
  const params = useSearchParams();

  const rawTab = params.get("tab");
  const rawSort = params.get("sort");
  const tab = TABS.includes(rawTab) ? rawTab : DEFAULTS.tab;
  const sortKey = rawSort && SORT_FIELDS[rawSort] ? rawSort : DEFAULTS.sort;
  const direction = params.get("dir") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const q = params.get("q") ?? "";

  const update = useCallback(
    (patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        const text = value == null ? "" : String(value);
        if (text === "" || text === DEFAULTS[key]) next.delete(key);
        else next.set(key, text);
      }
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [params, pathname],
  );

  return { tab, sortKey, direction, page, q, update };
}

export default function MarketClient() {
  const { tab, sortKey, direction, page, q, update } = useMarketUrlState();
  const [search, setSearch] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  useEffect(() => {
    if (search.trim() === q) return;
    const timeout = setTimeout(() => update({ q: search.trim() }), 250);
    return () => clearTimeout(timeout);
  }, [search, q, update]);

  const { data, isLoading, isError, refetch } = useCoinsMarket({ page: 1, perPage: PER_PAGE });
  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const toggleWatchlist = useAppStore((state) => state.toggleWatchlist);
  const handleToggleWatchlist = useCallback((coin) => toggleWatchlist(coin.id), [toggleWatchlist]);

  const coins = useMemo(() => data ?? [], [data]);

  const visibleCoins = useMemo(() => {
    const term = q.trim().toLowerCase();
    let result = coins;
    if (term) {
      result = result.filter(
        (coin) => coin.name?.toLowerCase().includes(term) || coin.symbol?.toLowerCase().includes(term),
      );
    }
    return sortCoins(filterByTab(result, tab), { key: sortKey, direction });
  }, [coins, q, tab, sortKey, direction]);

  const pageCount = Math.max(1, Math.ceil(visibleCoins.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedCoins = visibleCoins.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key) =>
    update({ sort: key, dir: sortKey === key && direction === "desc" ? "asc" : "desc" });

  const goToPage = (nextPage) => {
    update({ page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Markets</h1>
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <div className="md:hidden">
        <Select
          id="market-sort"
          aria-label="Sort coins"
          value={`${sortKey}:${direction}`}
          onChange={(event) => {
            const [key, dir] = event.target.value.split(":");
            update({ sort: key, dir });
          }}
        >
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
      </div>

      <TabsBar active={tab} onChange={(next) => update({ tab: next })} />

      <Card as="div" variant="outlined" className="market-table-card p-0!">
        <MarketTable
          coins={paginatedCoins}
          sort={{ key: sortKey, direction }}
          onSort={handleSort}
          watchlistedIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          loading={isLoading}
          error={isError ? "Could not load market data" : undefined}
          onRetry={refetch}
          emptyMessage={q ? `No coins match "${q}"` : "No market data available"}
        />
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)}>
          Previous
        </Button>
        <span className="text-sm text-[var(--color-text-muted)]">Page {safePage} of {pageCount}</span>
        <Button variant="outline" size="sm" disabled={safePage >= pageCount} onClick={() => goToPage(safePage + 1)}>
          Next
        </Button>
      </div>
    </section>
  );
}
