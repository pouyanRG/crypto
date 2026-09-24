"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import useCoinChart from "../../lib/hooks/useCoinChart";
import useCoinVolume from "../../lib/hooks/useCoinVolume";
import { COIN_LOGOS, MARKET_COIN_IDS } from "../../lib/coinAssets";
import { formatCompact, formatPrice } from "../../lib/formatters";
import { useAppStore } from "../../lib/store/useAppStore";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import MiniAreaChart from "../widgets/MiniAreaChart";

const formatChange = (value) =>
  value == null ? "—" : `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

const Sparkline = dynamic(() => import("../market/Sparkline"), { ssr: false });
const LineChartWidget = dynamic(() => import("../widgets/LineChartWidget"), { ssr: false });

export default function DashboardContent() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const { data, isLoading, isError } = useCoinsMarket({ ids: MARKET_COIN_IDS, perPage: MARKET_COIN_IDS.length });
  const { data: btcChart = [], isLoading: chartLoading, isError: chartError, refetch } = useCoinChart("bitcoin", 30);
  const coins = data ?? [];
  const watchlistIds = useAppStore((state) => state.watchlistIds);
  const { data: btcVolume = [] } = useCoinVolume("bitcoin", 7);
  const marketCapSeries = useMemo(() => {
    const list = (data ?? []).filter(
      (coin) => coin.sparkline_in_7d?.price?.length > 1 && coin.current_price && coin.market_cap,
    );
    if (!list.length) return [];
    const length = Math.min(...list.map((coin) => coin.sparkline_in_7d.price.length));
    return Array.from({ length }, (_, index) => ({
      value: list.reduce((sum, coin) => {
        const prices = coin.sparkline_in_7d.price;
        const supply = coin.market_cap / coin.current_price;
        return sum + prices[prices.length - length + index] * supply;
      }, 0),
    }));
  }, [data]);
  const featured = isExpanded ? coins : coins.slice(0, 3);
  const watchlistCoins = watchlistIds
    .map((id) => coins.find((coin) => coin.id === id))
    .filter(Boolean);
  const gainers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) >= 0).slice(0, 3);
  const losers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) < 0).slice(0, 3);
  const marketCap = coins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0);
  const volume = coins.reduce((sum, coin) => sum + (coin.total_volume ?? 0), 0);
  const trending = coins.slice(0, 3);
  const averageMove =
    coins.reduce((sum, coin) => sum + (Number(coin.price_change_percentage_24h) || 0), 0) / Math.max(coins.length, 1);
  const getCoinSparkline = (coin) => (coin.sparkline_in_7d?.price ?? []).map((value) => ({ value }));

  return (
    <div className="dashboard-shell py-6 sm:py-8">
      <header className="section-heading flex-col items-start md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Market overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-4xl">
            Institutional-grade crypto intelligence
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="kicker"><span className="kicker-dot" aria-hidden="true" />Live market pulse</span>
          <Button variant="secondary" size="sm">Export</Button>
          <Button size="sm">Review opportunities</Button>
        </div>
      </header>

      <section aria-label="Market highlights">
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={showHighlights}
            aria-label="Toggle market highlights"
            onClick={() => setShowHighlights((visible) => !visible)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"
          >
            <span>Highlights</span>
            <span
              aria-hidden="true"
              className={`relative h-6 w-11 rounded-full p-1 transition-colors ${showHighlights ? "bg-[var(--color-up)]" : "bg-[var(--color-border)]"}`}
            >
              <span className={`block size-4 rounded-full bg-white shadow-sm transition-transform ${showHighlights ? "translate-x-5" : "translate-x-0"}`} />
            </span>
          </button>
        </div>

        {showHighlights && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Key market metrics">
            <div className="flex flex-col gap-4">
              <Card className="metric-card min-h-[132px]">
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <div className="font-tabular text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {isLoading ? <Skeleton variant="text" className="w-32" /> : formatPrice(marketCap)}
                    </div>
                    <p className="mt-2 text-base font-semibold text-[var(--color-text-secondary)]">
                      Market Cap <span className={averageMove >= 0 ? "text-[var(--color-up)]" : "text-[var(--color-down)]"}>{averageMove >= 0 ? "▲" : "▼"} {Math.abs(averageMove).toFixed(2)}%</span>
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Tracked coins, 7d</p>
                  </div>
                  <MiniAreaChart id="mc-area" data={marketCapSeries} color="var(--color-accent)" />
                </div>
              </Card>

              <Card className="metric-card min-h-[132px]">
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <div className="font-tabular text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {isLoading ? <Skeleton variant="text" className="w-32" /> : formatPrice(volume)}
                    </div>
                    <p className="mt-2 text-base font-semibold text-[var(--color-text-secondary)]">24h Trading Volume</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">BTC 7d volume trend</p>
                  </div>
                  <MiniAreaChart id="vol-area" data={btcVolume} color="var(--color-chart-violet)" />
                </div>
              </Card>
            </div>

            <Card className="metric-card min-h-[280px]">
              <div className="mb-5 flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]"><span aria-hidden="true">🔥 </span>Trending</h2>
                <button type="button" className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">View more <span aria-hidden="true">›</span></button>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Most watched by the market</p>
              <ul className="mt-4 space-y-3">
                {trending.map((coin) => (
                  <li key={coin.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-text-secondary)]">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                      <span className="truncate font-medium text-[var(--color-text-secondary)]">{coin.name}</span>
                    </span>
                    <span className="shrink-0 font-tabular text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="metric-card min-h-[280px]">
              <div className="mb-5 flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]"><span aria-hidden="true">🚀 </span>Top Gainers</h2>
                <button type="button" className="text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">View more <span aria-hidden="true">›</span></button>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Biggest price increases</p>
              <ul className="mt-4 space-y-3">
                {gainers.slice(0, 3).map((coin) => (
                  <li key={coin.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-semibold text-[var(--color-text-secondary)]">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                      <span className="truncate font-medium text-[var(--color-text-secondary)]">{coin.name}</span>
                    </span>
                    <span className="shrink-0 font-tabular text-[var(--color-up)]">+{Number(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </section>

      <section aria-label="Bitcoin price chart">
        {chartError ? (
          <ErrorState title="Chart unavailable" description="Could not load Bitcoin price history." onRetry={refetch} />
        ) : chartLoading ? (
          <Card><Skeleton className="h-64 w-full" /></Card>
        ) : (
          <LineChartWidget title="Bitcoin · 30 days" data={btcChart} dataKey="price" xKey="timestamp" />
        )}
      </section>

      <section className="market-grid" aria-label="Market trends and movers">
        <Card className="market-panel">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Live trend</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Market pulse</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-[var(--color-text-muted)] sm:inline">Updated every minute</span>
              {coins.length > 3 && (
                <Button variant="secondary" size="sm" onClick={() => setIsExpanded((expanded) => !expanded)}>
                  {isExpanded ? "Show Less" : "Show More"}
                </Button>
              )}
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
              <ul className="divide-y divide-[var(--color-border-subtle)] md:hidden" aria-label="Market overview list">
                {featured.map((coin) => {
                  const change24h = coin.price_change_percentage_24h;
                  return (
                    <li key={coin.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {COIN_LOGOS[coin.id] ? (
                            <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark shrink-0 object-contain" />
                          ) : (
                            <span className="coin-mark shrink-0">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                          )}
                          <div className="min-w-0">
                            <div className="truncate font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                            <div className="text-xs text-[var(--color-text-muted)]">{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
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

              <div className="hidden overflow-x-auto md:block">
                <table className="market-table min-w-[720px]" aria-label="Market overview table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Price</th>
                      <th>1h</th>
                      <th>24h</th>
                      <th>7d</th>
                      <th>Volume</th>
                      <th>Market Cap</th>
                      <th>7d Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featured.map((coin) => (
                      <tr key={coin.id}>
                        <td>
                          <div className="coin-badge">
                            {COIN_LOGOS[coin.id] ? (
                              <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark object-contain" />
                            ) : (
                              <span className="coin-mark">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                            )}
                            <div>
                              <div className="font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                              <div className="text-xs text-[var(--color-text-muted)]">{coin.symbol.toUpperCase()}</div>
                            </div>
                          </div>
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
            </>
          )}
        </Card>

        <Card className="market-side">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Top movers</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Momentum</h2>
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">24h</span>
          </div>

          {gainers.length === 0 && losers.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No momentum data available</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
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
      </section>

      <section className="grid gap-4" aria-label="Watchlist and portfolio context">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Portfolio signal</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Watchlist snapshot</h2>
            </div>
            <Button variant="secondary" size="sm">Manage</Button>
          </div>

          {watchlistCoins.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No assets to show yet</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border-subtle)]">
              {watchlistCoins.map((coin) => {
                const change = coin.price_change_percentage_24h;
                return (
                  <li key={coin.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      {COIN_LOGOS[coin.id] ? (
                        <Image src={COIN_LOGOS[coin.id]} alt="" width={32} height={32} className="coin-mark shrink-0 object-contain" />
                      ) : (
                        <span className="coin-mark shrink-0">{coin.symbol.slice(0, 2).toUpperCase()}</span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">{coin.name}</div>
                        <div className="text-xs uppercase text-[var(--color-text-muted)]">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
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

      </section>
    </div>
  );
}