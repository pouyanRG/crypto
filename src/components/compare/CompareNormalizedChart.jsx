"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_COLORS = [
  "var(--color-compare-series-1)",
  "var(--color-compare-series-2)",
  "var(--color-compare-series-3)",
];

const formatIndex = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";

const formatXAxisTimestamp = (timestamp, days) =>
  typeof timestamp === "number"
    ? new Date(timestamp).toLocaleString(
        undefined,
        days <= 7
          ? { month: "short", day: "numeric", hour: "2-digit" }
          : { month: "short", day: "numeric" },
      )
    : "";

const formatReadoutTimestamp = (timestamp) =>
  typeof timestamp === "number"
    ? new Date(timestamp).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export default function CompareNormalizedChart({
  data = [],
  series = [],
  days = 30,
  emptyMessage = "There is not enough data to compare this range.",
}) {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleChartMove = (state) => {
    const index = Number(state?.activeTooltipIndex ?? state?.activeIndex);
    const nextIndex = Number.isInteger(index) && data[index] ? index : null;
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  };
  const activePoint = activeIndex == null ? null : data[activeIndex];

  if (data.length < 2 || series.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs"
      >
        <span className="text-[var(--color-text-muted)]">
          {activePoint
            ? formatReadoutTimestamp(activePoint.timestamp)
            : "Hover or tap the chart to inspect values"}
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {series.map((entry, index) => (
            <span key={entry.id} className="inline-flex items-center gap-1.5">
              <span className="max-w-28 truncate text-[var(--color-text-secondary)]">
                {entry.label}
              </span>
              <span
                className="font-tabular font-medium text-[var(--color-text-primary)]"
                style={{ color: SERIES_COLORS[index % SERIES_COLORS.length] }}
              >
                {formatIndex(activePoint?.[entry.id])}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 24, right: 12, left: 0, bottom: 0 }}
            onClick={handleChartMove}
            onMouseMove={handleChartMove}
            onTouchMove={handleChartMove}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <Tooltip
              content={() => null}
              cursor={{ stroke: "var(--color-border)" }}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <ReferenceLine y={100} stroke="var(--color-border)" strokeDasharray="4 4" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => formatXAxisTimestamp(value, days)}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(value) => Math.round(value)}
              domain={["auto", "auto"]}
            />
            <Legend
              wrapperStyle={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}
            />
            {series.map((entry, index) => (
              <Line
                key={entry.id}
                type="monotone"
                dataKey={entry.id}
                name={entry.label}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeDasharray={index === 2 ? "5 3" : undefined}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
