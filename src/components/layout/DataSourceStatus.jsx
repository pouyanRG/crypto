"use client";

import { useEffect, useState } from "react";
import Badge from "../ui/Badge";
import { isMarketDataStale } from "../../lib/marketFreshness";

const LABELS = { live: "Current", updating: "Updating", cached: "Recently received", stale: "Data delayed", offline: "Offline", waiting: "Waiting", unavailable: "Market data unavailable" };
const VARIANTS = { live: "up", updating: "neutral", cached: "neutral", stale: "down", offline: "down", waiting: "neutral", unavailable: "down" };
const DOT_COLORS = { up: "bg-[var(--color-up)]", down: "bg-[var(--color-down)]", neutral: "bg-[var(--color-neutral)]" };
const TEXT_COLORS = { up: "text-[var(--color-up)]", down: "text-[var(--color-down)]", neutral: "text-[var(--color-neutral)]" };
const COMPACT_LABELS = { live: "Current", updating: "Checking", cached: "Received", stale: "Delayed", offline: "Offline", waiting: "Waiting", unavailable: "No data" };

function formatAge(age) {
  if (age < 10_000) return "just now";
  if (age < 60_000) return `${Math.floor(age / 1_000)} sec ago`;
  if (age < 3_600_000) return `${Math.floor(age / 60_000)} min ago`;
  return `${Math.floor(age / 3_600_000)} hr ago`;
}

/** @param {{ status?: "live" | "updating" | "cached" | "stale" | "offline" | "unavailable" | string, compact?: boolean, lastUpdatedAt?: number, timestampSource?: "provider" | "response" }} props */
export default function DataSourceStatus({ status = "cached", compact = false, lastUpdatedAt, timestampSource }) {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const timeout = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 15_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const stale = lastUpdatedAt && now > 0 && isMarketDataStale(lastUpdatedAt, now);
  const effectiveStatus = stale && status !== "unavailable" && status !== "offline" ? "stale" : status;
  const label = LABELS[effectiveStatus] ?? LABELS.cached;
  const variant = VARIANTS[effectiveStatus] ?? VARIANTS.cached;
  const ageLabel = lastUpdatedAt && now > 0
    ? `${timestampSource === "provider" ? "Market data as of" : "Response received"} ${formatAge(now - lastUpdatedAt)}`
    : "No successful market response yet";
  const detail = effectiveStatus === "stale" && status === "updating"
    ? `Refreshing now · ${ageLabel.toLowerCase()}`
    : ageLabel;
  const accessibleLabel = `Market data status: ${label}. ${detail}`;

  if (compact) {
    return (
      <span
        role="status"
        aria-label={accessibleLabel}
        title={`${label} · ${detail}`}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${TEXT_COLORS[variant]}`}
      >
        <span aria-hidden="true" className={`size-2 rounded-full ${DOT_COLORS[variant]}`} />
        {COMPACT_LABELS[effectiveStatus] ?? label}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Badge variant={variant} aria-label={`Market data status: ${label}`}>{label}</Badge>
      <time
        className="max-w-40 truncate text-xs text-[var(--color-text-muted)]"
        dateTime={lastUpdatedAt ? new Date(lastUpdatedAt).toISOString() : undefined}
        title={lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : "Market data has not been successfully received yet"}
        aria-label={detail}
      >
        {detail}
      </time>
    </span>
  );
}