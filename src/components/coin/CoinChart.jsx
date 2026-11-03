"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Tabs from "../ui/Tabs";

const RANGES = ["24h", "7d", "30d", "1y"];

function ChartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 16.5 8.5 11l4 4L21 6.5" />
      <path d="M15.5 6.5H21v5.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

function formatPrice(value) {
  const fractionDigits =
    value > 0 && value < 1 ? Math.min(12, Math.max(4, Math.ceil(-Math.log10(value)) + 2)) : 2;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value >= 1 ? 2 : 0,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatTimestamp(value, range) {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return null;

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;

  const options =
    range === "24h"
      ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
      : { month: "short", day: "numeric", year: "numeric" };

  return {
    dateTime: date.toISOString(),
    label: new Intl.DateTimeFormat("en-US", options).format(date),
  };
}

function PriceTooltip({ active, payload, label, range }) {
  const point = payload?.[0];
  if (!active || !point || point.value == null || !Number.isFinite(Number(point.value))) return null;

  const timestamp = formatTimestamp(point.payload?.timestamp ?? label, range);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="min-w-48 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 shadow-[var(--shadow-float)]"
    >
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent-text)]">
          <ClockIcon />
        </span>
        {timestamp ? (
          <time dateTime={timestamp.dateTime}>{timestamp.label}</time>
        ) : (
          <span>Selected price</span>
        )}
      </div>
      <div className="my-3 h-px bg-[var(--color-border-subtle)]" />
      <div className="flex items-center justify-between gap-5">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className="size-2 rounded-full bg-[var(--color-accent)]" />
          Price
        </span>
        <strong className="font-tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {formatPrice(Number(point.value))}
        </strong>
      </div>
    </div>
  );
}

export default function CoinChart({ data = [], range = "24h", onRangeChange, title = "Price history" }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent-muted)] text-[var(--color-accent-text)]">
            <ChartIcon />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-[var(--letter-spacing-heading)] text-[var(--color-text-primary)]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">USD market price</p>
          </div>
        </div>
        <Tabs
          id="coin-chart-ranges"
          ariaLabel="Chart timeframe"
          tabs={RANGES.map((value) => ({ value, label: value }))}
          active={range}
          onChange={onRangeChange}
          activationMode="automatic"
          panelId="coin-chart-panel"
          appearance="polished"
          className="sm:w-[232px]"
        />
      </div>

      <div
        id={`coin-chart-panel-${range}`}
        role="tabpanel"
        aria-labelledby={`coin-chart-ranges-${range}`}
        className="h-64 sm:h-72"
        tabIndex={0}
      >
        {data.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">
            No price history available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="coin-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                content={<PriceTooltip range={range} />}
                cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
                animationDuration={200}
                animationEasing="cubic-bezier(0.2,0,0,1)"
                isAnimationActive="auto"
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="var(--color-accent)"
                fill="url(#coin-area)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-accent)", stroke: "var(--color-bg-elevated)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
