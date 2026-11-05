"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import useExchanges from "../../lib/hooks/useExchanges";
import useExchangeVolumeCharts from "../../lib/hooks/useExchangeVolumeCharts";
import useTrendingCoins from "../../lib/hooks/useTrendingCoins";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { useDefiChains, useDefiProtocols } from "../../lib/hooks/useDefiData";
import { filterAndSortCoins } from "../../lib/screener";
import { filterAndSortExchanges, getCountryOptions } from "../../lib/exchanges";
import { formatCompact, formatPercent, formatPrice, formatUsd } from "../../lib/formatters";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ErrorState from "../ui/ErrorState";
import Select from "../ui/Select";
import ExchangeTable from "./ExchangeTable";
import ExchangeCard from "./ExchangeCard";
import DiscoverStatCard from "./DiscoverStatCard";
import NavIcon from "../layout/NavIcon";

const TABS = [
  { id: "exchanges", label: "Exchanges", icon: "bank" },
  { id: "trending", label: "Trending coins", icon: "flame" },
  { id: "defi", label: "DeFi / TVL", icon: "cube" },
  { id: "screener", label: "Screener", icon: "filter" },
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

function TabButton({ active, children, onClick, id, icon }) {
  return (
    <button
      id={`discover-tab-${id}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="discover-panel"
      onClick={onClick}
      className={clsx(
        icon
          ? "inline-flex min-h-10 w-full items-center justify-start gap-2 rounded-[var(--radius-card)] border px-2.5 py-2 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-standard)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:w-auto sm:gap-3 sm:px-4 sm:text-sm"
          : "min-h-11 rounded-[var(--radius-md)] border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-[var(--ease-standard)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
        icon
          ? active
            ? "border-transparent bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
          : active
            ? "border-[var(--color-accent)]/35 bg-[var(--color-accent-muted)] text-[var(--color-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            : "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
      )}
    >
      {icon && <NavIcon name={icon} className="size-4 shrink-0 sm:size-5" />}
      {children}
    </button>
  );
}

function SearchIcon() {
  return <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="8.75" cy="8.75" r="5.75" /><path d="m13 13 4 4" /></svg>;
}

function ExchangesPanel({ query }) {
  const [filters, setFilters] = useState({ query: "", country: "", rating: "all", sortBy: "volume" });
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data = [], isLoading, isError, refetch, isFetching } = query;
  const countries = useMemo(() => getCountryOptions(data), [data]);
  const exchanges = useMemo(() => filterAndSortExchanges(data, filters), [data, filters]);
  const ratedExchanges = data.filter((exchange) => exchange.trust_score != null);
  const averageTrustScore = ratedExchanges.length
    ? ratedExchanges.reduce((total, exchange) => total + exchange.trust_score, 0) / ratedExchanges.length
    : null;
  const combinedVolume = data.reduce((total, exchange) => total + exchange.trade_volume_24h_btc, 0);
  const pageCount = Math.max(1, Math.ceil(exchanges.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleExchanges = exchanges.slice((safePage - 1) * pageSize, safePage * pageSize);
  const volumeCharts = useExchangeVolumeCharts(visibleExchanges.map((exchange) => exchange.id));
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DiscoverStatCard icon="bank" value={isError ? "—" : formatCompact(data.length)} label="Exchanges tracked" loading={isLoading} />
        <DiscoverStatCard icon="barChart" value={isError || !data.length ? "—" : `${formatCompact(combinedVolume)} BTC`} label="24h trading volume" loading={isLoading} />
        <DiscoverStatCard icon="shieldCheck" value={averageTrustScore == null ? "—" : `${averageTrustScore.toFixed(1)}/10`} label="Average trust score" loading={isLoading} />
      </div>

      <div className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2 lg:col-span-5 lg:col-start-1 lg:row-start-1">
          <Input
            id="exchange-search"
            aria-label="Search exchanges by name or country"
            placeholder="Search by name or country"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            onClear={() => updateFilter("query", "")}
            leadingIcon={<SearchIcon />}
            appearance="polished"
            className="min-h-11 bg-[var(--color-surface)] placeholder:text-[var(--color-text-secondary)]"
          />
        </div>
        <div className="grid gap-1.5 lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <Select id="exchange-country" aria-label="Filter by country" leadingIcon={<NavIcon name="globe" className="size-4" />} value={filters.country} onChange={(event) => updateFilter("country", event.target.value)}>
            <option value="">All countries</option>
            {countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </Select>
        </div>
        <div className="grid gap-1.5 lg:col-span-2 lg:col-start-3 lg:row-start-2">
          <Select id="exchange-rating" aria-label="Filter by trust score" leadingIcon={<NavIcon name="star" className="size-4" />} value={filters.rating} onChange={(event) => updateFilter("rating", event.target.value)}>
            <option value="all">All ratings</option>
            <option value="high">High (9-10)</option>
            <option value="medium">Medium (6-8)</option>
            <option value="low">Low (0-5)</option>
          </Select>
        </div>
        <div className="grid gap-1.5 lg:col-span-2 lg:col-start-5 lg:row-start-2">
          <Select id="exchange-sort" aria-label="Sort exchanges" leadingIcon={<NavIcon name="sort" className="size-4" />} value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
            <option value="volume">Sort by: 24h volume</option>
            <option value="trust">Trust score</option>
            <option value="name">Name</option>
          </Select>
        </div>
        <Button variant="outline" size="md" className="min-h-11 w-full sm:col-span-2 sm:w-auto lg:col-span-1 lg:col-start-6 lg:row-start-1" onClick={() => refetch()} loading={isFetching}>
          <NavIcon name="refresh" className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
        <p>{isLoading ? "Loading exchanges…" : `${exchanges.length} exchanges`}</p>
        <p>Volume is shown in BTC · refreshes every five minutes</p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          Loading exchanges…
        </p>
      ) : visibleExchanges.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No exchanges match these filters.
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <ExchangeTable exchanges={visibleExchanges} startIndex={(safePage - 1) * pageSize} volumeCharts={volumeCharts} />
          </div>
          <ul className="divide-y divide-[var(--color-border)] md:hidden">
            {visibleExchanges.map((exchange) => <ExchangeCard key={exchange.id} exchange={exchange} chart={volumeCharts.byId?.[exchange.id]} />)}
          </ul>
        </>
      )}

      {exchanges.length > pageSize && (
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <span className="text-sm text-[var(--color-text-muted)]">Page {safePage} of {pageCount}</span>
          <Button variant="outline" size="sm" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</Button>
        </div>
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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            Trending coins
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Coins most searched in the last 24 hours.
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => refetch()} loading={isFetching}>
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
        <>
        <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] md:block">
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
        </div>
        <ul className="space-y-3 md:hidden">
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
              <li key={coin.id}>
                <Card as="article" className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-secondary)]">
                        #{index + 1}
                      </span>
                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        className="min-w-0 text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                      >
                        <span className="block truncate font-medium">{coin.name}</span>
                        <span className="text-xs uppercase text-[var(--color-text-muted)]">{coin.symbol}</span>
                      </Link>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
                      Rank {coin.market_cap_rank == null ? "—" : `#${coin.market_cap_rank}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3 text-sm">
                    <span className="font-tabular text-[var(--color-text-primary)]">{formatPrice(coin.price)}</span>
                    <span className={clsx("font-tabular", changeTone)}>{formatPercent(change)}</span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
        </>
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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">
            DeFi total value locked
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            Compare protocol and chain TVL. Chain-level values are shown separately and are not summed.
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => refresh()} loading={isFetching}>
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

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Card as="div" variant="compact" className="bg-[var(--color-bg-elevated)] p-3 sm:p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Protocols tracked</p>
          <p className="mt-2 font-tabular text-lg font-semibold text-[var(--color-text-primary)]">
            {protocolsQuery.isError ? "—" : formatCompact(protocols.length)}
          </p>
        </Card>
        <Card as="div" variant="compact" className="bg-[var(--color-bg-elevated)] p-3 sm:p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Chains tracked</p>
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
        <>
        <div className="hidden md:block">
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
        </div>
        <ul className="space-y-3 md:hidden">
          {view === "protocols"
            ? visibleProtocols.map((protocol, index) => (
                <li key={protocol.id}>
                  <Card as="article" className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--color-text-primary)]">
                          <span className="mr-2 text-xs text-[var(--color-text-muted)]">#{index + 1}</span>
                          {protocol.name}
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          {protocol.symbol ? `${protocol.symbol.toUpperCase()} · ` : ""}
                          {protocol.category || "Uncategorized"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
                        {protocol.chains.length} chains
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)]">TVL</p>
                        <p className="mt-1 font-tabular font-semibold text-[var(--color-text-primary)]">
                          {formatUsd(protocol.tvl)}
                        </p>
                      </div>
                      <div className="flex gap-3 text-right text-sm font-tabular">
                        <div><p className="text-xs text-[var(--color-text-muted)]">1d</p><PnlText value={protocol.change_1d} /></div>
                        <div><p className="text-xs text-[var(--color-text-muted)]">7d</p><PnlText value={protocol.change_7d} /></div>
                      </div>
                    </div>
                  </Card>
                </li>
              ))
            : visibleChains.map((chain, index) => (
                <li key={chain.name}>
                  <Card as="article" className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--color-text-primary)]">
                        <span className="mr-2 text-xs text-[var(--color-text-muted)]">#{index + 1}</span>
                        {chain.name}
                      </p>
                      <p className="mt-1 text-xs uppercase text-[var(--color-text-secondary)]">
                        {chain.tokenSymbol || "Native token unavailable"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-[var(--color-text-muted)]">TVL</p>
                      <p className="mt-1 font-tabular font-semibold text-[var(--color-text-primary)]">
                        {formatUsd(chain.tvl)}
                      </p>
                    </div>
                  </Card>
                </li>
              ))}
        </ul>
        </>
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
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[var(--color-text-primary)]">Coin screener</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
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
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
        </div>
      </div>

      <Card as="div" className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
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

      <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
        <p>{isLoading ? "Loading market data…" : `${filteredCoins.length} matching coins`}</p>
        <p>Market data · refreshes every five minutes</p>
      </div>

      {!isLoading && visibleCoins.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No coins match these filters.
        </p>
      ) : (
        <>
        <div className="hidden overflow-x-auto md:block">
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
        </div>
        <ul className="space-y-3 md:hidden">
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
              <li key={coin.id}>
                <Card as="article" className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/coin/${encodeURIComponent(coin.id)}`}
                      className="min-w-0 text-[var(--color-text-primary)] hover:text-[var(--color-accent)]"
                    >
                      <span className="block truncate font-medium">{coin.name}</span>
                      <span className="text-xs uppercase text-[var(--color-text-muted)]">{coin.symbol}</span>
                    </Link>
                    <span className="shrink-0 rounded-full bg-[var(--color-bg-elevated)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
                      #{coin.market_cap_rank ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
                    <span className="font-tabular font-medium text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</span>
                    <span className={clsx("font-tabular text-sm", changeTone)}>{formatPercent(change)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[var(--color-text-muted)]">Market cap</p>
                      <p className="mt-1 truncate font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.market_cap)}</p>
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[var(--color-text-muted)]">24h volume</p>
                      <p className="mt-1 truncate font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.total_volume)}</p>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
        </>
      )}

      {filteredCoins.length > pageSize && (
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="min-w-0 px-2 sm:px-3"
            disabled={safePage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="whitespace-nowrap text-xs text-[var(--color-text-muted)] sm:text-sm">
            Page {safePage} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="min-w-0 px-2 sm:px-3"
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
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-[2rem]">
          Discover
        </h1>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
          Explore public market data. No personal financial data is collected.
        </p>
      </header>

      <div className="w-full max-w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1 sm:w-fit">
        <div className="grid w-full grid-cols-2 gap-1 rounded-[var(--radius-card)] bg-[var(--color-bg)] p-1 sm:flex sm:w-auto" role="tablist" aria-label="Market discovery">
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>
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
