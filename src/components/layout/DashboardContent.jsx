"use client";

import Image from "next/image";
import { useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { COIN_LOGOS, MARKET_COIN_IDS } from "../../lib/coinAssets";
import { formatCompact, formatPrice } from "../../lib/formatters";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";

function TrendArrow({ positive }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={positive ? "h-4 w-4 text-[var(--color-up)]" : "h-4 w-4 text-[var(--color-down)]"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {positive ? (
        <path d="M5 12.5 9 8.5l2.5 2.5L15 6.5" />
      ) : (
        <path d="M5 7.5 9 11.5l2.5-2.5L15 13.5" />
      )}
      <path d="M15 13.5v-5h-5" />
    </svg>
  );
}

export default function DashboardContent() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const { data, isLoading, isError } = useCoinsMarket({ ids: MARKET_COIN_IDS, perPage: MARKET_COIN_IDS.length });
  const coins = data ?? [];
  const featured = isExpanded ? coins : coins.slice(0, 3);
  const gainers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) >= 0).slice(0, 3);
  const losers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) < 0).slice(0, 3);
  const marketCap = coins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0);
  const volume = coins.reduce((sum, coin) => sum + (coin.total_volume ?? 0), 0);
  const trending = coins.slice(0, 3);

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
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4" aria-label="Key market metrics">
            <Card className="metric-card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Trending</h2>
                <span aria-hidden="true">🔥</span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Most watched by the market</p>
              <ul className="mt-4 space-y-3">
                {trending.map((coin) => (
                  <li key={coin.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-[var(--color-text-secondary)]">{coin.name}</span>
                    <span className="shrink-0 font-tabular text-[var(--color-text-primary)]">{formatPrice(coin.current_price)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="metric-card">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Top Gainers</h2>
                <span aria-hidden="true">🚀</span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Biggest price increases</p>
              <ul className="mt-4 space-y-3">
                {gainers.slice(0, 3).map((coin) => (
                  <li key={coin.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium text-[var(--color-text-secondary)]">{coin.name}</span>
                    <span className="shrink-0 font-tabular text-[var(--color-up)]">+{Number(coin.price_change_percentage_24h || 0).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="metric-card hidden xl:col-span-2 xl:block">
              <p className="text-sm text-[var(--color-text-secondary)]">24h Trading Volume</p>
              <p className="mt-5 font-tabular text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                {isLoading ? <Skeleton variant="text" className="w-24" /> : formatPrice(volume)}
              </p>
              <p className="mt-2 text-xs text-[var(--color-up)]">How much was traded</p>
            </Card>

            <Card className="metric-card hidden xl:col-span-2 xl:block">
              <p className="text-sm text-[var(--color-text-secondary)]">Market Cap</p>
              <p className="mt-5 font-tabular text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                {isLoading ? <Skeleton variant="text" className="w-24" /> : formatPrice(marketCap)}
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Total market value</p>
            </Card>
          </div>
        )}
      </section>

      <section className="market-grid" aria-label="Market trends and movers">
        <Card className="market-panel">
          <div className="mb-5 flex items-center justify-between gap-3">
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
            <table className="market-table" aria-label="Market overview table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Price</th>
                  <th>1h</th>
                  <th>24h</th>
                  <th>7d</th>
                  <th>Volume</th>
                  <th>Market Cap</th>
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
                        {coin.price_change_percentage_1h_in_currency == null ? "—" : `${coin.price_change_percentage_1h_in_currency >= 0 ? "+" : ""}${Number(coin.price_change_percentage_1h_in_currency).toFixed(2)}%`}
                      </span>
                    </td>
                    <td>
                      <span className={`price-pill ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span className={`price-pill ${(coin.price_change_percentage_7d_in_currency ?? 0) >= 0 ? "up" : "down"}`}>
                        {coin.price_change_percentage_7d_in_currency == null ? "—" : `${coin.price_change_percentage_7d_in_currency >= 0 ? "+" : ""}${Number(coin.price_change_percentage_7d_in_currency).toFixed(2)}%`}
                      </span>
                    </td>
                    <td className="font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.total_volume)}</td>
                    <td className="font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.market_cap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="market-side">
          <div className="mb-5">
            <p className="eyebrow">Top movers</p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Momentum</h2>
          </div>

          <ul className="muted-list space-y-0">
            {gainers.length > 0 && (
              <li className="py-3">
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>Gainers</span>
                  <span className="text-[var(--color-up)]">Strong</span>
                </div>
                {gainers.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <TrendArrow positive />
                      <span className="font-medium text-[var(--color-text-primary)]">{coin.symbol.toUpperCase()}</span>
                    </div>
                    <span className="font-tabular text-[var(--color-up)]">
                      +{Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </li>
            )}
            {losers.length > 0 && (
              <li className="py-3">
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>Losers</span>
                  <span className="text-[var(--color-down)]">Cooling</span>
                </div>
                {losers.map((coin) => (
                  <div key={coin.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center gap-2">
                      <TrendArrow positive={false} />
                      <span className="font-medium text-[var(--color-text-primary)]">{coin.symbol.toUpperCase()}</span>
                    </div>
                    <span className="font-tabular text-[var(--color-down)]">
                      {Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </li>
            )}
          </ul>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]" aria-label="Watchlist and portfolio context">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Portfolio signal</p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Strategic watchlist</h2>
            </div>
            <Button variant="secondary" size="sm">Manage</Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {featured.map((coin) => (
              <div key={coin.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--color-text-secondary)]">{coin.symbol.toUpperCase()}</span>
                  <span className={`price-pill ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                    {Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="mt-4 font-tabular text-xl font-semibold text-[var(--color-text-primary)]">
                  {formatPrice(coin.current_price)}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </section>
    </div>
  );
}