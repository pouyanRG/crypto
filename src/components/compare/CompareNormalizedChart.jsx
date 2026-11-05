"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { downsampleCompareChartRows } from "../../lib/compare";

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
  const chartData = useMemo(
    () => downsampleCompareChartRows(data, series.map(({ id }) => id)),
    [data, series],
  );

  const handleChartMove = (state) => {
    const index = Number(state?.activeTooltipIndex ?? state?.activeIndex);
    const nextIndex = Number.isInteger(index) && chartData[index] ? index : null;
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
  };
  const activePoint = chartData[activeIndex] ?? chartData[chartData.length - 1] ?? null;

  const getYAxisDomain = ([dataMin, dataMax]) => {
    if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
      return ["auto", "auto"];
    }

    const min = Math.min(dataMin, 100);
    const max = Math.max(dataMax, 100);
    const padding = Math.max((max - min) * 0.08, 1.5);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  if (data.length < 2 || series.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="compare-chart w-full">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mb-4 grid min-h-11 gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs sm:flex sm:items-center sm:justify-between sm:gap-4"
      >
        <span className="leading-relaxed text-[var(--color-text-secondary)]">
          {activePoint ? formatReadoutTimestamp(activePoint.timestamp) : "—"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {series.map((entry, index) => (
            <span
              key={entry.id}
              className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1"
            >
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }}
              />
              <span className="max-w-28 truncate text-[var(--color-text-secondary)]">
                {entry.label}
              </span>
              <span
                className="font-tabular font-semibold"
                style={{ color: SERIES_COLORS[index % SERIES_COLORS.length] }}
              >
                {formatIndex(activePoint?.[entry.id])}
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            accessibilityLayer={false}
            margin={{ top: 16, right: 16, left: 4, bottom: 8 }}
            onClick={handleChartMove}
            onMouseMove={handleChartMove}
            onTouchMove={handleChartMove}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <Tooltip
              content={() => null}
              cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
              wrapperStyle={{ pointerEvents: "none" }}
            />
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
            <ReferenceLine y={100} stroke="var(--color-text-muted)" strokeDasharray="5 5" />
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              padding={{ left: 8, right: 24 }}
              tickFormatter={(value) => formatXAxisTimestamp(value, days)}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickMargin={8}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
              tickCount={5}
              tickMargin={8}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(value) => Math.round(value)}
              domain={getYAxisDomain}
            />
            {series.map((entry, index) => (
              <Line
                key={entry.id}
                type="linear"
                dataKey={entry.id}
                name={entry.label}
                stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2.25}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: SERIES_COLORS[index % SERIES_COLORS.length],
                  stroke: "var(--color-surface)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}