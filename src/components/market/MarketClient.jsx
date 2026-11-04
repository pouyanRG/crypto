"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useAppStore } from "../../lib/store/useAppStore";
import Card from "../ui/Card";
import Button from "../ui/Button";
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
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);

  if (q !== prevQ) {
    setPrevQ(q);
    setSearch(q);
  }

  useEffect(() => {
    if (!sortMenuOpen) return;

    const handlePointerDown = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setSortMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSortMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sortMenuOpen]);

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

  const currentSortValue = `${sortKey}:${direction}`;
  const currentSortLabel = SORT_OPTIONS.find(([value]) => value === currentSortValue)?.[1] ?? "Market cap ↓";

  const goToPage = (nextPage) => {
    update({ page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="market-page space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="market-page-title text-2xl leading-tight font-semibold tracking-[var(--letter-spacing-heading)] text-[var(--color-text-primary)]">Markets</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBar value={search} onChange={setSearch} />

        <div className="md:hidden">
          <div ref={sortMenuRef} className="relative">
            <button
              type="button"
              aria-label="Sort coins"
              aria-haspopup="listbox"
              aria-expanded={sortMenuOpen}
              onClick={() => setSortMenuOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-accent)] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%),var(--color-surface)] px-4 py-3 text-left text-base font-medium text-[var(--color-text-primary)] shadow-[0_0_0_1px_rgba(59,130,246,0.12),0_18px_32px_rgba(2,6,23,0.28)] transition-[border-color,background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:border-[var(--color-accent)] hover:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_55%),var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.99]"
            >
              <span className="tracking-[-0.01em]">{currentSortLabel}</span>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 text-[var(--color-text-secondary)] transition-transform duration-200 ease-[cubic-bezier(0.2,0,0,1)]" style={{ transform: sortMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 7.5 5 5 5-5" /></svg>
            </button>

            {sortMenuOpen && (
              <div role="listbox" aria-label="Sort coin list" className="mt-2 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[0_18px_32px_rgba(2,6,23,0.38),0_8px_16px_rgba(0,0,0,0.18)]">
                {SORT_OPTIONS.map(([value, label], index) => {
                  const isSelected = value === currentSortValue;
                  return (
                    <button
                      key={value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        const [key, dir] = value.split(":");
                        update({ sort: key, dir });
                        setSortMenuOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between px-4 py-3 text-left text-base font-medium transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                        isSelected
                          ? "bg-[linear-gradient(90deg,rgba(191,219,254,0.82),rgba(219,234,254,0.65))] text-[#0f172a]"
                          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
                        index !== SORT_OPTIONS.length - 1 && "border-b border-[var(--color-border-subtle)]",
                      ].join(" ")}
                    >
                      <span className="tracking-[-0.01em]">{label}</span>
                      {isSelected && <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-full bg-[#0f172a]/10 text-[11px] font-bold text-[#0f172a]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="md:order-first md:flex-none">
          <TabsBar active={tab} onChange={(next) => update({ tab: next })} />
        </div>
      </div>

      <div id="market-results" role="tabpanel" aria-labelledby={`market-tabs-${tab}`} tabIndex={0} className="space-y-5">
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

        <nav aria-label="Market pagination" className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Button variant="outline" size="sm" className="min-h-11 min-w-11 px-3 text-sm active:scale-[0.98] disabled:opacity-75" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)}>
            Previous
          </Button>
          <span aria-live="polite" aria-atomic="true" className="text-center text-sm font-medium tabular-nums text-[var(--color-text-secondary)]">Page {safePage} of {pageCount}</span>
          <Button variant="outline" size="sm" className="min-h-11 min-w-11 px-3 text-sm active:scale-[0.98] disabled:opacity-75" disabled={safePage >= pageCount} onClick={() => goToPage(safePage + 1)}>
            Next
          </Button>
        </nav>
      </div>
    </section>
  );
}
