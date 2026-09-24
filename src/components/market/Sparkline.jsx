"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "../../lib/formatters";

export default function Sparkline({ data = [], positive = true }) {
  if (data.length < 2) return <span className="text-xs text-[var(--color-text-muted)]">No 7d data</span>;

  return (
    <div className="h-8 w-24" aria-label={positive ? "Positive seven-day trend" : "Negative seven-day trend"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
          <XAxis dataKey="timestamp" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            cursor={{ stroke: "var(--color-border)" }}
            contentStyle={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-chart-tooltip)",
              color: "var(--color-text-primary)",
              fontSize: "0.7rem",
              padding: "0.35rem 0.5rem",
            }}
            labelFormatter={(value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value)) : "7-day point"}
            formatter={(value) => [formatPrice(value), "Price"]}
          />
          <Line type="monotone" dataKey="value" stroke={positive ? "var(--color-up)" : "var(--color-down)"} fill="none" strokeWidth={1.5} dot={false} activeDot={{ r: 2.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}