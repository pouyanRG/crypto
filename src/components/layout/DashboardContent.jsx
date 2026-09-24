"use client";

import Image from "next/image";
import { useState } from "react";
import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import { COIN_LOGOS, MARKET_COIN_IDS } from "../../lib/coinAssets";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

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
  const { data, isLoading, isError } = useCoinsMarket({ ids: MARKET_COIN_IDS, perPage: MARKET_COIN_IDS.length });
  const coins = data ?? [];
  const bitcoin = coins.find((coin) => coin.id === "bitcoin") ?? coins[0];
  const featured = isExpanded ? coins : coins.slice(0, 3);
  const gainers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) >= 0).slice(0, 3);
  const losers = [...coins].filter((coin) => Number(coin.price_change_percentage_24h) < 0).slice(0, 3);
  const marketCap = coins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0);
  const volume = coins.reduce((sum, coin) => sum + (coin.total_volume ?? 0), 0);
  const averageMove =
    coins.reduce((sum, coin) => sum + (Number(coin.price_change_percentage_24h) || 0), 0) / Math.max(coins.length, 1);

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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Key market metrics">
        {[
          {
            label: "Total market cap",
            value: isLoading ? null : priceFormatter.format(marketCap),
            change: "+2.84%",
            positive: true,
          },
          {
            label: "24h volume",
            value: isLoading ? null : priceFormatter.format(volume),
            change: "+6.18%",
            positive: true,
          },
          {
            label: "BTC dominance",
            value: isLoading ? null : `${(bitcoin?.market_cap_percentage ?? 0).toFixed(1)}%`,
            change: "+0.42%",
            positive: true,
          },
          {
            label: "Average move",
            value: isLoading ? null : `${averageMove.toFixed(2)}%`,
            change: "Across tracked assets",
            positive: averageMove >= 0,
          },
        ].map((item) => (
          <Card key={item.label} className="metric-card">
            <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div className="font-tabular text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                {isLoading ? <Skeleton variant="text" className="w-24" /> : item.value ?? "—"}
              </div>
              <div className={`price-pill ${item.positive ? "up" : "down"}`}>
                {item.change}
              </div>
            </div>
          </Card>
        ))}
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
                  <th>24h</th>
                  <th>Volume</th>
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
                    <td className="font-tabular text-[var(--color-text-primary)]">{priceFormatter.format(coin.current_price)}</td>
                    <td>
                      <span className={`price-pill ${coin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {Number(coin.price_change_percentage_24h || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td className="font-tabular text-[var(--color-text-secondary)]">{compactFormatter.format(coin.total_volume ?? 0)}</td>
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
                  {priceFormatter.format(coin.current_price)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="eyebrow">Market note</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">Signal summary</h2>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Risk appetite remains constructive while liquidity stays concentrated in large-cap leaders. Maintain measured exposure and monitor trend quality before adding new positions.
          </p>
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-accent-muted)] p-3">
            <div className="text-sm text-[var(--color-text-secondary)]">Bitcoin reference</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="font-tabular text-xl font-semibold text-[var(--color-text-primary)]">
                {bitcoin ? priceFormatter.format(bitcoin.current_price) : "—"}
              </span>
              <span className={`price-pill ${bitcoin && bitcoin.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                {bitcoin ? `${bitcoin.price_change_percentage_24h >= 0 ? "+" : ""}${Number(bitcoin.price_change_percentage_24h || 0).toFixed(2)}%` : "—"}
              </span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}