"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { COIN_LOGOS, MARKET_COIN_IDS } from "../../lib/coinAssets";
import { formatCompact, formatPrice } from "../../lib/formatters";
import { useAppStore } from "../../lib/store/useAppStore";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import MarketHero from "./MarketHero";
import DataSourceStatus from "./DataSourceStatus";
import { getMarketDataFreshness } from "../../lib/marketFreshness";

const INITIAL_COUNT = 3;

const formatChange = (value) =>
  value == null ? "—" : `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

const Sparkline = dynamic(() => import("../market/Sparkline"), { ssr: false });
const LineChartWidget = dynamic(() => import("../widgets/LineChartWidget"), { ssr: false });

export default function DashboardContent() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const panelRef = useRef(null);
  const mobileListRef = useRef(null);
  const tableViewportRef = useRef(null);
  const hasMeasuredMarketContent = useRef(false);
  const [chartNow, setChartNow] = useState(0);
  const { data, isLoading, isError, isFetching, dataUpdatedAt, refetch } = useCoinsMarket({ ids: MARKET_COIN_IDS, perPage: MARKET_COIN_IDS.length });
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setChartNow(Date.now()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);
  const coins = data ?? [];
  const marketDataFreshness = getMarketDataFreshness(data, dataUpdatedAt);
  const pulseStatus = isError ? (data ? "stale" : "unavailable") : isFetching ? "updating" : marketDataFreshness?.source === "provider" ? "live" : "cached";
  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const marketCapSeries = useMemo(() => {
    const list = (data ?? []).filter(
      (coin) => coin.sparkline_in_7d?.price?.length > 1 && coin.current_price && coin.market_cap,
    );
    if (!list.length) return [];
    const length = Math.min(...list.map((coin) => coin.sparkline_in_7d.price.length));
    const stepMs = (7 * 24 * 60 * 60 * 1000) / length;
    return Array.from({ length }, (_, index) => ({
      timestamp: chartNow - (length - 1 - index) * stepMs,
      value: list.reduce((sum, coin) => {
        const prices = coin.sparkline_in_7d.price;
        const supply = coin.market_cap / coin.current_price;
        return sum + prices[prices.length - length + index] * supply;
      }, 0),
    }));
  }, [chartNow, data]);
  const isExpanded = visibleCount > INITIAL_COUNT;
  const showMore = () => setVisibleCount(coins.length);
  const showLess = () => {
    setVisibleCount(INITIAL_COUNT);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const toggleMarketList = () => {
    if (isExpanded) {
      showLess();
      return;
    }

    showMore();
  };
  useLayoutEffect(() => {
    const nodes = [mobileListRef.current, tableViewportRef.current].filter(Boolean);
    if (!nodes.length) return;

    const measureCollapsedHeight = (node) => {
      const rows = node.matches(".market-mobile-list")
        ? node.children
        : node.querySelectorAll("tbody tr");
      const lastVisibleRow = rows[INITIAL_COUNT - 1];
      if (!lastVisibleRow) return node.scrollHeight;
      const nextRow = rows[INITIAL_COUNT];
      const visiblePeek = 88;
      const collapsedBottom = nextRow
        ? nextRow.getBoundingClientRect().top + visiblePeek
        : lastVisibleRow.getBoundingClientRect().bottom;
      return Math.ceil(collapsedBottom - node.getBoundingClientRect().top);
    };

    nodes.forEach((node) => {
      const targetHeight = isExpanded ? node.scrollHeight : measureCollapsedHeight(node);
      if (!hasMeasuredMarketContent.current) {
        node.style.height = isExpanded ? "auto" : `${targetHeight}px`;
        return;
      }

      const currentHeight = node.style.height === "auto" ? node.scrollHeight : node.getBoundingClientRect().height;
      node.style.height = `${currentHeight}px`;
      void node.offsetHeight;
      node.style.height = `${targetHeight}px`;

      if (isExpanded) {
        const finishExpansion = (event) => {
          if (event.target === node && event.propertyName === "height") node.style.height = "auto";
        };
        node.addEventListener("transitionend", finishExpansion, { once: true });

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          node.style.height = "auto";
        }
      }
    });

    hasMeasuredMarketContent.current = true;

    const syncHeightOnResize = () => {
      nodes.forEach((node) => {
        node.style.height = isExpanded ? "auto" : `${measureCollapsedHeight(node)}px`;
      });
    };
    window.addEventListener("resize", syncHeightOnResize);
    return () => window.removeEventListener("resize", syncHeightOnResize);
  }, [coins.length, isExpanded]);
  const watchlistCoins = watchlistIds
    .map((id) => coins.find((coin) => coin.id === id))
    .filter(Boolean);
  const gainers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) >= 0).slice(0, 3);
  const losers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) < 0).slice(0, 3);
  const marketCap = coins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0);
  const averageMove =
    coins.reduce((sum, coin) => sum + (Number(coin.price_change_percentage_24h) || 0), 0) / Math.max(coins.length, 1);
  const getCoinSparkline = (coin) => (coin.sparkline_in_7d?.price ?? []).map((value) => ({ value }));

  return (
    <div className="dashboard-shell pt-0 pb-6 sm:pb-8">
      <MarketHero
        marketCap={marketCap}
        marketCapChange={coins.length ? averageMove : null}
        marketCapSeries={marketCapSeries}
        coins={coins}
        loading={isLoading}
      />

      <section aria-label="Total market capitalization chart">
        {isLoading ? (
          <Card>
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Market Cap · 7 days</h2>
              <span className="text-xs text-[var(--color-text-muted)]">USD</span>
            </div>
            <Skeleton className="h-64 w-full" />
          </Card>
        ) : isError ? (
          <Card>
            <ErrorState
              title="Total market cap unavailable"
              description="Could not load the 7-day market cap data."
              onRetry={refetch}
            />
          </Card>
        ) : (
          <LineChartWidget title="Market Cap · 7 days" data={marketCapSeries} dataKey="value" xKey="timestamp" />
        )}
      </section>

      <section className="market-grid" aria-label="Market trends and movers">
        <Card ref={panelRef} className="market-panel scroll-mt-24">
          <div className="market-panel-header mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Market trend</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Market pulse</h2>
            </div>
            <div className="market-panel-toolbar flex items-center gap-3">
              <span className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] sm:text-sm">
                <span className="hidden sm:inline-flex"><DataSourceStatus status={pulseStatus} lastUpdatedAt={marketDataFreshness?.timestamp} timestampSource={marketDataFreshness?.source} /></span>
                <span className="inline-flex sm:hidden"><DataSourceStatus status={pulseStatus} compact lastUpdatedAt={marketDataFreshness?.timestamp} timestampSource={marketDataFreshness?.source} /></span>
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton variant="row" className="h-12" />
              <Skeleton variant="row" className="h-12" />
              <Skeleton variant="row" className="h-12" />
            </div>
          ) : isError ? (
            <ErrorState title="Market data unavailable" description="We could not refresh the latest market overview." />
          ) : (
            <>
              <div className={`market-panel-content${isExpanded || coins.length <= INITIAL_COUNT ? " is-expanded" : ""}`}>
                <ul
                  id="market-overview-mobile"
                  ref={mobileListRef}
                  className="market-mobile-list divide-y divide-[var(--color-border-subtle)] md:hidden"
                  aria-label="Market overview list"
                >
                  {coins.map((coin, index) => {
                    const change24h = coin.price_change_percentage_24h;
                    return (
                      <li key={coin.id} inert={index >= INITIAL_COUNT && !isExpanded} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <Link
                            href={`/coin/${coin.id}`}
                            className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                          >
                            {COIN_LOGOS[coin.id] ? (
                              <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark shrink-0 object-contain" />
                            ) : (
                              <span className="coin-mark shrink-0">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                            )}
                            <div className="min-w-0">
                              <div className="truncate font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                              <div className="text-xs text-[var(--color-text-muted)]">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </Link>
                          <div className="shrink-0 text-right">
                            <div className="font-tabular text-sm text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</div>
                            <span className={`price-pill mt-1 ${change24h >= 0 ? "up" : "down"}`}>{formatChange(change24h)}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-xs text-[var(--color-text-muted)]">
                            MCap <span className="font-tabular">{formatCompact(coin.market_cap)}</span>
                            {" · "}
                            Vol <span className="font-tabular">{formatCompact(coin.total_volume)}</span>
                          </p>
                          <Sparkline data={getCoinSparkline(coin)} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} />
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div
                  id="market-overview-table"
                  ref={tableViewportRef}
                  className="market-table-viewport hidden md:block"
                >
                  <table className="market-table" aria-label="Market overview table">
                    <caption className="sr-only">Market prices, price changes, trading volume, market capitalization, and seven-day trends</caption>
                    <thead>
                      <tr>
                        <th scope="col">Asset</th>
                        <th scope="col">Price</th>
                        <th scope="col">1h</th>
                        <th scope="col">24h</th>
                        <th scope="col">7d</th>
                        <th scope="col">Volume</th>
                        <th scope="col">Market Cap</th>
                        <th scope="col">7d Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coins.map((coin, index) => (
                        <tr key={coin.id} inert={index >= INITIAL_COUNT && !isExpanded}>
                          <td>
                            <Link
                              href={`/coin/${coin.id}`}
                              className="coin-badge rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                            >
                              {COIN_LOGOS[coin.id] ? (
                                <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark object-contain" />
                              ) : (
                                <span className="coin-mark">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                              )}
                              <div>
                                <div className="font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                                <div className="text-xs text-[var(--color-text-muted)]">{coin.symbol.toUpperCase()}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="font-tabular text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</td>
                          <td>
                            <span className={`price-pill ${(coin.price_change_percentage_1h_in_currency ?? 0) >= 0 ? "up" : "down"}`}>
                              {formatChange(coin.price_change_percentage_1h_in_currency)}
                            </span>
                          </td>
                          <td>
                            <span className={`price-pill ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                              {formatChange(coin.price_change_percentage_24h)}
                            </span>
                          </td>
                          <td>
                            <span className={`price-pill ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "up" : "down"}`}>
                              {formatChange(coin.price_change_percentage_7d_in_currency)}
                            </span>
                          </td>
                          <td className="font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.total_volume)}</td>
                          <td className="font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.market_cap)}</td>
                          <td><Sparkline data={getCoinSparkline(coin)} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {coins.length > INITIAL_COUNT && (
                <div className={`market-panel-footer${isExpanded ? " is-expanded" : ""}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="market-panel-toggle"
                    type="button"
                    aria-label={isExpanded ? "Show fewer market assets" : "Show all market assets"}
                    aria-expanded={isExpanded}
                    aria-controls="market-overview-mobile market-overview-table"
                    onClick={toggleMarketList}
                  >
                    <svg
                      aria-hidden="true"
                      className={`market-panel-chevron${isExpanded ? " is-expanded" : ""}`}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        <aside className="market-side" aria-label="Side panels">
          <Card className="market-side-card">
            <div className="market-side-heading mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Top movers</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Momentum</h2>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">24h</span>
            </div>

            {gainers.length === 0 && losers.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No momentum data available</p>
            ) : (
              <div className="grid gap-6">
                {[{ label: "Gainers", items: gainers, colorClass: "text-[var(--color-up)]", prefix: "+" }, { label: "Losers", items: losers, colorClass: "text-[var(--color-down)]", prefix: "" }].map((group) => (
                  <div key={group.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${group.colorClass}`}>{group.label}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{group.items.length}</span>
                    </div>
                    <ul className="divide-y divide-[var(--color-border-subtle)]">
                      {group.items.map((coin, index) => (
                        <li key={coin.id} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="w-4 shrink-0 text-xs text-[var(--color-text-muted)]">{index + 1}</span>
                            <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">{coin.symbol.toUpperCase()}</span>
                          </span>
                          <span className={`shrink-0 font-tabular text-sm font-medium ${group.colorClass}`}>
                            {group.prefix}{Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="market-side-card">
            <div className="market-side-heading mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Market signal</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Watchlist snapshot</h2>
              </div>
              <Link
                href="/watchlist"
                className="market-manage-link inline-flex min-h-8 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium transition-all duration-200 ease-out hover:bg-[var(--color-surface-hover)] active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                Manage
              </Link>
            </div>

            {watchlistCoins.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No assets to show yet</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border-subtle)]">
                {watchlistCoins.map((coin) => {
                  const change = coin.price_change_percentage_24h;
                  return (
                    <li key={coin.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <Link
                        href={`/coin/${coin.id}`}
                        className="flex min-w-0 items-center gap-3 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                      >
                        {COIN_LOGOS[coin.id] ? (
                          <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark shrink-0 object-contain" />
                        ) : (
                          <span className="coin-mark shrink-0">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                          <div className="text-xs uppercase text-[var(--color-text-muted)]">{coin.symbol}</div>
                      </div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-3">
                        <Sparkline data={getCoinSparkline(coin)} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} />
                        <div className="text-right">
                          <div className="font-tabular text-sm font-semibold text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</div>
                          <span className={`price-pill mt-1 ${change >= 0 ? "up" : "down"}`}>{formatChange(change)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </aside>
      </section>
    </div>
  );
}
