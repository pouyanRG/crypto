"use client";

import { Line, LineChart, Tooltip, YAxis } from "recharts";
import { formatPrice } from "../../lib/formatters";

const paddedDomain = ([min, max]) => {
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * 0.1;
  return [min - pad, max + pad];
};

export default function Sparkline({ data = [], positive = true }) {
  if (data.length < 2) return <span className="text-xs text-[var(--color-text-muted)]">No 7d data</span>;

  return (
    <div className="h-8 w-24" aria-label={positive ? "Positive seven-day trend" : "Negative seven-day trend"}>
      <LineChart width={96} height={32} data={data} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
        <YAxis hide domain={paddedDomain} />
        <Tooltip
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-chart-tooltip)", color: "var(--color-text-primary)", fontSize: "0.7rem", padding: "0.35rem 0.5rem" }}
          labelFormatter={() => "7-day point"}
          formatter={(value) => [formatPrice(value), "Price"]}
        />
        <Line type="monotone" dataKey="value" stroke={positive ? "var(--color-up)" : "var(--color-down)"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
      </LineChart>
    </div>
  );
}