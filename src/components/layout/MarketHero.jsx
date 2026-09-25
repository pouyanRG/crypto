"use client";

import MiniAreaChart from "../widgets/MiniAreaChart";
import { formatPrice } from "../../lib/formatters";

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

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3m0 0 4 4m-4-4-4 4M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
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

export default function MarketHero({ marketCap, marketCapChange, marketCapSeries = [], loading = false }) {
  const isUp = (marketCapChange ?? 0) >= 0;

  return (
    <section className="market-hero" aria-label="Market overview">
      <div className="market-hero-eyebrow">
        <span className="market-hero-rule" aria-hidden="true" />
        <span>Market overview</span>
      </div>

      <h1 className="market-hero-title">
        <span>Institutional-grade</span>
        <span className="market-hero-title-gradient">crypto intelligence</span>
      </h1>

      <p className="market-hero-subtitle">
        Real-time market data, advanced analytics and actionable insights for smarter decisions.
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
          <MiniAreaChart id="hero-pulse" data={marketCapSeries} color="var(--color-up)" />
        </div>

        <button type="button" aria-label="View market pulse details" className="market-hero-pulse-arrow">
          <ArrowIcon />
        </button>
      </div>

      <div className="market-hero-actions">
        <button type="button" className="market-hero-cta">
          <span className="market-hero-btn-left"><SparkleIcon />Review opportunities</span>
          <ArrowIcon />
        </button>
        <button type="button" className="market-hero-export">
          <span className="market-hero-btn-left"><ExportIcon />Export</span>
          <ArrowIcon />
        </button>
      </div>
    </section>
  );
}
