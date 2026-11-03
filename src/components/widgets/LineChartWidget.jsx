"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";

const formatValue = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);

function getDate(timestamp) {
  const date = new Date(Number(timestamp));
  return Number.isNaN(date.getTime()) ? null : date;
}

const formatDate = (timestamp) => {
  const date = getDate(timestamp);
  return date
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric" }).format(date)
    : "";
};

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

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4.5" width="14" height="12" rx="2" />
      <path d="M6.5 3v3M13.5 3v3M3 8h14" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M12.5 7.5h-3a1.75 1.75 0 0 0 0 3.5h1a1.75 1.75 0 0 1 0 3.5h-3M10 5.75v8.5" />
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

function MarketTooltip({ active, payload, label, xKey }) {
  const point = payload?.[0];
  if (!active || !point || point.value == null || !Number.isFinite(Number(point.value))) return null;

  const date = getDate(point.payload?.[xKey] ?? label);

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
        {date ? (
          <time dateTime={date.toISOString()}>
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(date)}
          </time>
        ) : (
          <span>Selected time</span>
        )}
      </div>
      <div className="my-3 h-px bg-[var(--color-border-subtle)]" />
      <div className="flex items-center justify-between gap-5">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className="size-2 rounded-full bg-[var(--color-accent)]" />
          {point.name ?? "Market cap"}
        </span>
        <strong className="font-tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {formatValue(Number(point.value))}
        </strong>
      </div>
    </div>
  );
}

export default function LineChartWidget({
  title = "Market trend",
  data = [],
  dataKey = "value",
  xKey = "timestamp",
}) {
  const [heading, range] = title.split(" · ", 2);

  return (
    <Card
      as="section"
      aria-labelledby="market-cap-chart-title"
      className="border-[var(--color-border-subtle)] !p-4 sm:!p-6"
    >
      <div className="market-cap-chart-header mb-6 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="market-cap-chart-icon flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-accent-text)]">
            <ChartIcon />
          </span>
          <div className="min-w-0">
            <h2
              id="market-cap-chart-title"
              aria-label={title}
              className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold leading-snug tracking-[var(--letter-spacing-heading)] text-[var(--color-text-primary)] sm:text-lg"
            >
              <span className="truncate">{heading}</span>
              {range && (
                <span className="market-cap-chart-range inline-flex shrink-0 items-center gap-1 rounded-[var(--radius-pill)] px-2 py-1 text-[11px] font-semibold tracking-normal">
                  <CalendarIcon />
                  {range}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
              Total crypto market capitalization
            </p>
          </div>
        </div>
        <span className="market-cap-chart-currency inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] px-3 text-xs font-semibold tracking-wide">
          <CurrencyIcon />
          USD
        </span>
      </div>

      <div className="h-72 w-full sm:h-80">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-secondary)]">
            No chart data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="market-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey={xKey}
                tickFormatter={formatDate}
                tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-border)" }}
                minTickGap={40}
                tickMargin={12}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                content={<MarketTooltip xKey={xKey} />}
                cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
                animationDuration={200}
                animationEasing="cubic-bezier(0.2,0,0,1)"
                isAnimationActive="auto"
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                name="Market cap"
                stroke="var(--color-accent)"
                fill="url(#market-area)"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--color-accent)",
                  stroke: "var(--color-bg-elevated)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
