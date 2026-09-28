"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_COLORS = [
  "var(--color-accent)",
  "var(--color-up)",
  "var(--color-chart-violet)",
];

const formatIndex = (value) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "—";

export default function CompareNormalizedChart({ data = [], series = [] }) {
  const [activePoint, setActivePoint] = useState(null);

  const handleChartMove = (state) => {
    const rowIndex = state?.activeTooltipIndex ?? state?.activeIndex;
    if (!Number.isInteger(rowIndex) || !data[rowIndex]) return;

    setActivePoint({
      label: state.activeLabel ?? data[rowIndex].label,
      values: Object.fromEntries(series.map(({ id }) => [id, data[rowIndex][id]])),
    });
  };

  if (data.length < 2 || series.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
        Select at least two coins to compare indexed performance.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs">
        <span className="text-[var(--color-text-muted)]">
          {activePoint?.label ?? "Hover or tap the chart to inspect values"}
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
                {formatIndex(activePoint?.values?.[entry.id])}
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
            onMouseMove={handleChartMove}
            onTouchMove={handleChartMove}
          >
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
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
            tickFormatter={(value) => `${value}`}
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
