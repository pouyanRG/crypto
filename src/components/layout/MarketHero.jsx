"use client";

import Link from "next/link";
import MiniAreaChart from "../widgets/MiniAreaChart";
import { formatPrice } from "../../lib/formatters";
import DashboardActionsMenu from "./DashboardActionsMenu";

function SparkleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="currentColor">
      <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l2-7 4 14 2-7h8" />
    </svg>
  );
}

export default function MarketHero({ marketCap, marketCapChange, marketCapSeries = [], coins = [], loading = false }) {
  const isUp = (marketCapChange ?? 0) >= 0;

  return (
    <section className="market-hero" aria-label="Market snapshot">
      <div className="flex justify-end">
        <DashboardActionsMenu coins={coins} loading={loading} />
      </div>

      <h1 className="market-hero-title">
        <span>Tracked crypto</span>
        <span className="market-hero-title-gradient">market snapshot</span>
      </h1>

      <p className="market-hero-subtitle">
        Prices, market capitalization and 24-hour movement across the dashboard&apos;s tracked assets.
      </p>

      <div className="market-hero-pulse">
        <span className="market-hero-pulse-icon" aria-hidden="true">
          <span className="market-hero-pulse-dot" />
          <PulseIcon />
        </span>

        <div className="market-hero-pulse-label">
          <p className="market-hero-pulse-title">Live market pulse</p>
          <p className="market-hero-pulse-sub">Top coins &bull; Real-time</p>
        </div>

        <div className="market-hero-pulse-stat">
          <p className="market-hero-pulse-stat-label">Total Market Cap</p>
          <p className="market-hero-pulse-stat-value">{loading ? "—" : formatPrice(marketCap)}</p>
          {marketCapChange != null && (
            <p className={`market-hero-pulse-stat-change ${isUp ? "up" : "down"}`}>
              <span aria-hidden="true">{isUp ? "▲" : "▼"}</span> {isUp ? "+" : ""}
              {marketCapChange.toFixed(2)}% (24h)
            </p>
          )}
        </div>

        <div className="market-hero-pulse-chart" aria-hidden="true">
          <MiniAreaChart id="hero-pulse" data={marketCapSeries} color="var(--color-up)" width={88} height={40} />
        </div>

        <Link href="/market" aria-label="View market pulse details" className="market-hero-pulse-arrow">
          <ArrowIcon />
        </Link>
      </div>

      <div className="market-hero-actions">
        <Link href="/market" className="market-hero-cta">
          <span className="market-hero-btn-left"><SparkleIcon />Review opportunities</span>
          <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
