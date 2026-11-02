"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import useExchanges from "../../lib/hooks/useExchanges";
import useTrendingCoins from "../../lib/hooks/useTrendingCoins";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useDefiChains, useDefiProtocols } from "../../lib/hooks/useDefiData";
import { filterAndSortCoins } from "../../lib/screener";
import { formatCompact, formatPercent, formatPrice, formatUsd } from "../../lib/formatters";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ErrorState from "../ui/ErrorState";
import Select from "../ui/Select";

const TABS = [
  { id: "exchanges", label: "Exchanges" },
  { id: "trending", label: "Trending coins" },
  { id: "defi", label: "DeFi / TVL" },
  { id: "screener", label: "Screener" },
];

const INITIAL_SCREENER_FILTERS = {
  query: "",
  minMarketCap: "",
  maxMarketCap: "",
  minVolume: "",
  minChange: "",
  maxChange: "",
  sortBy: "market_cap",
};

function TabButton({ active, children, onClick, id }) {
  return (
    <button
      id={`discover-tab-${id}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="discover-panel"
      onClick={onClick}
      className={clsx(
        "rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        active
          ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
      )}
    >
      {children}
    </button>
  );
}

function ExchangesPanel({ query }) {
  const [search, setSearch] = useState("");
  const { data = [], isLoading, isError, refetch, isFetching } = query;
  const exchanges = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...data]
      .filter((exchange) =>
        `${exchange.name} ${exchange.country ?? ""}`.toLowerCase().includes(term),
      )
      .sort((a, b) => b.trade_volume_24h_btc - a.trade_volume_24h_btc);
  }, [data, search]);

  if (isError) {
    return (
      <ErrorState
        title="Exchange rankings unavailable"
        description="Unable to load exchange volume data. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Exchange rankings
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Ranked by reported 24-hour trading volume. Volume is shown in BTC.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
          Refresh
        </Button>
      </div>

      <Input
        id="exchange-search"
        label="Search exchanges"
        placeholder="Search by name or country"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onClear={() => setSearch("")}
      />

      {isLoading ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          Loading exchange rankings…
        </p>
      ) : exchanges.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No exchanges match your search.
        </p>
      ) : (
        <Card as="div" variant="outlined" className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Exchange rankings by reported 24-hour trading volume</caption>
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">#</th>
                <th scope="col" className="px-4 py-3 font-medium">Exchange</th>
                <th scope="col" className="px-4 py-3 font-medium">Country</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Trust score</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">24h volume</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.map((exchange, index) => (
                <tr
                  key={exchange.id}
                  className="border-b border-[var(--color-border)] last:border-0"
                >
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{index + 1}</td>
                  <th scope="row" className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                    {exchange.name}
                  </th>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {exchange.country || "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {exchange.trust_score == null ? "—" : `${exchange.trust_score}/10`}
                  </td>
                  <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">
                    {formatCompact(exchange.trade_volume_24h_btc)} BTC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function TrendingPanel({ query }) {
  const { data = [], isLoading, isError, refetch, isFetching } = query;

  if (isError) {
    return (
      <ErrorState
        title="Trending coins unavailable"
        description="Unable to load trending search data. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Trending coins
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Coins most searched in the last 24 hours.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          Loading trending coins…
        </p>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No trending coins are available right now.
        </p>
      ) : (
        <Card as="div" variant="outlined" className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Trending search coins</caption>
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Search rank</th>
                <th scope="col" className="px-4 py-3 font-medium">Coin</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Market rank</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">24h</th>
              </tr>
            </thead>
            <tbody>
              {data.map((coin, index) => {
                const change = coin.price_change_percentage_24h;
                const changeTone =
                  change == null
                    ? "text-[var(--color-text-muted)]"
                    : change > 0
                      ? "text-[var(--color-up)]"
                      : change < 0
                        ? "text-[var(--color-down)]"
                        : "text-[var(--color-text-muted)]";

                return (
                  <tr key={coin.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{index + 1}</td>
                    <th scope="row" className="px-4 py-3 font-medium">
                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {coin.name}
                        <span className="ml-2 text-xs uppercase text-[var(--color-text-muted)]">
                          {coin.symbol}
                        </span>
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-secondary)]">
                      {coin.market_cap_rank == null ? "—" : `#${coin.market_cap_rank}`}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular">
                      {formatPrice(coin.price)}
                    </td>
                    <td className={clsx("px-4 py-3 text-right font-tabular", changeTone)}>
                      {formatPercent(change)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function PnlText({ value }) {
  const tone =
    value == null
      ? "text-[var(--color-text-muted)]"
      : value > 0
        ? "text-[var(--color-up)]"
        : value < 0
          ? "text-[var(--color-down)]"
          : "text-[var(--color-text-muted)]";

  return <span className={tone}>{formatPercent(value)}</span>;
}

function DefiPanel() {
  const [view, setView] = useState("protocols");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const protocolsQuery = useDefiProtocols();
  const chainsQuery = useDefiChains();
  const protocols = protocolsQuery.data ?? [];
  const chains = chainsQuery.data ?? [];

  const categories = useMemo(
    () => [...new Set(protocols.map((protocol) => protocol.category).filter(Boolean))].sort(),
    [protocols],
  );
  const visibleProtocols = useMemo(() => {
    const term = search.trim().toLowerCase();
    return protocols
      .filter((protocol) => {
        const matchesSearch =
          !term ||
          protocol.name.toLowerCase().includes(term) ||
          protocol.symbol?.toLowerCase().includes(term) ||
          protocol.chains.some((chain) => chain.toLowerCase().includes(term));
        return matchesSearch && (!category || protocol.category === category);
      })
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 100);
  }, [protocols, search, category]);
  const visibleChains = useMemo(
    () =>
      chains
        .filter((chain) => chain.name.toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, 100),
    [chains, search],
  );
  const isLoading = view === "protocols" ? protocolsQuery.isLoading : chainsQuery.isLoading;
  const isError = view === "protocols" ? protocolsQuery.isError : chainsQuery.isError;
  const isFetching = view === "protocols" ? protocolsQuery.isFetching : chainsQuery.isFetching;
  const refresh = view === "protocols" ? protocolsQuery.refetch : chainsQuery.refetch;
  const rows = view === "protocols" ? visibleProtocols : visibleChains;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            DeFi total value locked
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Compare protocol and chain TVL. Chain-level values are shown separately and are not summed.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()} loading={isFetching}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="DeFi rankings">
        {[
          { id: "protocols", label: "Protocols" },
          { id: "chains", label: "Chains" },
        ].map((item) => (
          <TabButton
            key={item.id}
            id={`defi-${item.id}`}
            active={view === item.id}
            onClick={() => setView(item.id)}
          >
            {item.label}
          </TabButton>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card as="div" variant="compact">
          <p className="text-xs text-[var(--color-text-muted)]">Protocols tracked</p>
          <p className="mt-2 font-tabular text-lg font-semibold text-[var(--color-text-primary)]">
            {protocolsQuery.isError ? "—" : formatCompact(protocols.length)}
          </p>
        </Card>
        <Card as="div" variant="compact">
          <p className="text-xs text-[var(--color-text-muted)]">Chains tracked</p>
          <p className="mt-2 font-tabular text-lg font-semibold text-[var(--color-text-primary)]">
            {chainsQuery.isError ? "—" : formatCompact(chains.length)}
          </p>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          id="defi-search"
          label={view === "protocols" ? "Search protocols or chains" : "Search chains"}
          placeholder={view === "protocols" ? "Search name or chain" : "Search chain name"}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
        />
        {view === "protocols" && (
          <Select
            id="defi-category"
            label="Protocol category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        )}
      </div>

      {isError ? (
        <ErrorState
          title="DeFi rankings unavailable"
          description="DeFiLlama could not load TVL data. Please try again."
          onRetry={refresh}
        />
      ) : isLoading ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          Loading DeFi TVL data…
        </p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No {view} match your filters.
        </p>
      ) : (
        <Card as="div" variant="outlined" className="overflow-x-auto p-0">
          {view === "protocols" ? (
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Leading DeFi protocols by total value locked</caption>
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">#</th>
                  <th scope="col" className="px-4 py-3 font-medium">Protocol</th>
                  <th scope="col" className="px-4 py-3 font-medium">Category</th>
                  <th scope="col" className="px-4 py-3 font-medium">Chains</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">TVL</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">1d</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">7d</th>
                </tr>
              </thead>
              <tbody>
                {visibleProtocols.map((protocol, index) => (
                  <tr key={protocol.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{index + 1}</td>
                    <th scope="row" className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {protocol.name}
                      {protocol.symbol && (
                        <span className="ml-2 text-xs uppercase text-[var(--color-text-muted)]">
                          {protocol.symbol}
                        </span>
                      )}
                    </th>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {protocol.category || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {protocol.chains.length}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">
                      {formatUsd(protocol.tvl)}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular">
                      <PnlText value={protocol.change_1d} />
                    </td>
                    <td className="px-4 py-3 text-right font-tabular">
                      <PnlText value={protocol.change_7d} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Leading blockchain networks by total value locked</caption>
              <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">#</th>
                  <th scope="col" className="px-4 py-3 font-medium">Chain</th>
                  <th scope="col" className="px-4 py-3 font-medium">Native token</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">TVL</th>
                </tr>
              </thead>
              <tbody>
                {visibleChains.map((chain, index) => (
                  <tr key={chain.name} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{index + 1}</td>
                    <th scope="row" className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                      {chain.name}
                    </th>
                    <td className="px-4 py-3 uppercase text-[var(--color-text-secondary)]">
                      {chain.tokenSymbol || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">
                      {formatUsd(chain.tvl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
      <p className="text-xs text-[var(--color-text-muted)]">
        Showing up to 100 matches per view. TVL is an estimate from DeFiLlama and may vary by methodology; data refreshes about every five minutes.
      </p>
    </div>
  );
}

function ScreenerPanel() {
  const [filters, setFilters] = useState(INITIAL_SCREENER_FILTERS);
  const [page, setPage] = useState(1);
  const { data = [], isLoading, isError, isFetching, refetch } = useCoinsMarket({
    perPage: 250,
    sparkline: false,
    refreshInterval: 300_000,
  });
  const filteredCoins = useMemo(() => filterAndSortCoins(data, filters), [data, filters]);
  const pageSize = 30;
  const pageCount = Math.max(1, Math.ceil(filteredCoins.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleCoins = filteredCoins.slice((safePage - 1) * pageSize, safePage * pageSize);
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  if (isError) {
    return (
      <ErrorState
        title="Screener data unavailable"
        description="Unable to load market data for filtering. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Coin screener</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Filter and sort the top 250 coins by market cap. Filters run in your browser.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters(INITIAL_SCREENER_FILTERS);
              setPage(1);
            }}
          >
            Clear filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        </div>
      </div>

      <Card as="div" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          id="screener-search"
          label="Coin name or symbol"
          placeholder="e.g. bitcoin or BTC"
          value={filters.query}
          onChange={(event) => updateFilter("query", event.target.value)}
          onClear={() => updateFilter("query", "")}
        />
        <Input
          id="screener-min-market-cap"
          label="Minimum market cap (USD)"
          type="number"
          min="0"
          placeholder="No minimum"
          value={filters.minMarketCap}
          onChange={(event) => updateFilter("minMarketCap", event.target.value)}
        />
        <Input
          id="screener-max-market-cap"
          label="Maximum market cap (USD)"
          type="number"
          min="0"
          placeholder="No maximum"
          value={filters.maxMarketCap}
          onChange={(event) => updateFilter("maxMarketCap", event.target.value)}
        />
        <Input
          id="screener-min-volume"
          label="Minimum 24h volume (USD)"
          type="number"
          min="0"
          placeholder="No minimum"
          value={filters.minVolume}
          onChange={(event) => updateFilter("minVolume", event.target.value)}
        />
        <Input
          id="screener-min-change"
          label="Minimum 24h change (%)"
          type="number"
          placeholder="No minimum"
          value={filters.minChange}
          onChange={(event) => updateFilter("minChange", event.target.value)}
        />
        <Input
          id="screener-max-change"
          label="Maximum 24h change (%)"
          type="number"
          placeholder="No maximum"
          value={filters.maxChange}
          onChange={(event) => updateFilter("maxChange", event.target.value)}
        />
        <Select
          id="screener-sort"
          label="Sort results"
          value={filters.sortBy}
          onChange={(event) => updateFilter("sortBy", event.target.value)}
        >
          <option value="market_cap">Market cap: high to low</option>
          <option value="volume">24h volume: high to low</option>
          <option value="change_desc">24h change: gainers first</option>
          <option value="change_asc">24h change: losers first</option>
        </Select>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-secondary)]">
        <p>{isLoading ? "Loading market data…" : `${filteredCoins.length} matching coins`}</p>
        <p>Market data · refreshes every five minutes</p>
      </div>

      {!isLoading && visibleCoins.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No coins match these filters.
        </p>
      ) : (
        <Card as="div" variant="outlined" className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Coins matching the selected market filters</caption>
            <thead className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">#</th>
                <th scope="col" className="px-4 py-3 font-medium">Coin</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">24h</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Market cap (USD)</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">24h volume (USD)</th>
              </tr>
            </thead>
            <tbody>
              {visibleCoins.map((coin) => {
                const change = coin.price_change_percentage_24h;
                const changeTone =
                  change == null
                    ? "text-[var(--color-text-muted)]"
                    : change > 0
                      ? "text-[var(--color-up)]"
                      : change < 0
                        ? "text-[var(--color-down)]"
                        : "text-[var(--color-text-muted)]";

                return (
                  <tr key={coin.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {coin.market_cap_rank ?? "—"}
                    </td>
                    <th scope="row" className="px-4 py-3 font-medium">
                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        {coin.name}
                        <span className="ml-2 text-xs uppercase text-[var(--color-text-muted)]">
                          {coin.symbol}
                        </span>
                      </Link>
                    </th>
                    <td className="px-4 py-3 text-right font-tabular">{formatPrice(coin.current_price)}</td>
                    <td className={clsx("px-4 py-3 text-right font-tabular", changeTone)}>
                      {formatPercent(change)}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular">{formatCompact(coin.market_cap)}</td>
                    <td className="px-4 py-3 text-right font-tabular">{formatCompact(coin.total_volume)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {filteredCoins.length > pageSize && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Page {safePage} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= pageCount}
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DiscoverClient() {
  const [activeTab, setActiveTab] = useState("exchanges");
  const exchangesQuery = useExchanges({ enabled: activeTab === "exchanges" });
  const trendingQuery = useTrendingCoins({ enabled: activeTab === "trending" });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Discover</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Explore public market data. No personal holdings or portfolio data are collected.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Market discovery">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      <div
        id="discover-panel"
        role="tabpanel"
        aria-labelledby={`discover-tab-${activeTab}`}
        className="space-y-4"
      >
        {activeTab === "exchanges" && (
          <ExchangesPanel query={exchangesQuery} />
        )}
        {activeTab === "trending" && (
          <TrendingPanel query={trendingQuery} />
        )}
        {activeTab === "defi" && <DefiPanel />}
        {activeTab === "screener" && <ScreenerPanel />}
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">
        Additional DeFi metrics from{" "}
        <a
          href="https://defillama.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-[var(--color-text-primary)]"
        >
          DeFiLlama
        </a>
        . Rankings and estimates may be delayed or incomplete.
      </p>
    </section>
  );
}
