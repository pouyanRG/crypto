"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
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
  if (data.length < 2 || series.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-muted)]">
        Select at least two coins to compare indexed performance.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
          <Tooltip
            formatter={(value, name) => [formatIndex(value), name]}
            labelFormatter={(label) => label}
            contentStyle={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-chart-tooltip)",
              color: "var(--color-text-primary)",
              fontSize: "0.75rem",
            }}
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
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
