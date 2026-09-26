"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { COIN_LOGOS, MARKET_COIN_IDS } from "../../lib/coinAssets";
import { formatCompact, formatPrice } from "../../lib/formatters";
import { useAppStore } from "../../lib/store/useAppStore";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import MarketHero from "./MarketHero";

const formatChange = (value) =>
  value == null ? "—" : `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;

const Sparkline = dynamic(() => import("../market/Sparkline"), { ssr: false });
const LineChartWidget = dynamic(() => import("../widgets/LineChartWidget"), { ssr: false });

export default function DashboardContent() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, isError } = useCoinsMarket({ ids: MARKET_COIN_IDS, perPage: MARKET_COIN_IDS.length });
  const coins = data ?? [];
  const watchlistIds = useAppStore((state) => state.watchlistIds);
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
  const averageMove =
    coins.reduce((sum, coin) => sum + (Number(coin.price_change_percentage_24h) || 0), 0) / Math.max(coins.length, 1);
  const getCoinSparkline = (coin) => (coin.sparkline_in_7d?.price ?? []).map((value) => ({ value }));

  return (
    <div className="dashboard-shell py-6 sm:py-8">
      <MarketHero
        marketCap={marketCap}
        marketCapChange={coins.length ? averageMove : null}
        marketCapSeries={marketCapSeries}
        coins={coins}
        loading={isLoading}
      />

      <section aria-label="Total market capitalization chart">
        {isLoading ? (
          <Card><Skeleton className="h-64 w-full" /></Card>
        ) : (
          <LineChartWidget title="Market Cap · 7 days" data={marketCapSeries} dataKey="value" />
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

        <aside className="market-side" aria-label="Side panels">
          <Card>
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

          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Portfolio signal</p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Watchlist snapshot</h2>
              </div>
              <Link
                href="/watchlist"
                className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium transition-all duration-200 ease-out hover:bg-[var(--color-surface-hover)] active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
