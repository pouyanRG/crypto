"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "../../lib/formatters";

function formatTooltipValue(value) {
  return formatPrice(value);
}

function formatTooltipDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric" }).format(new Date(value));
}

export default function MarketMetricChart({ data = [], dataKey, color = "var(--color-accent)", label }) {
  if (data.length < 2) {
    return <div className="flex h-24 w-full items-center justify-center text-xs text-[var(--color-text-muted)]">No chart data</div>;
  }

  return (
    <div className="h-24 w-full min-w-0" aria-label={`${label} chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 2, bottom: 0, left: 2 }}>
          <XAxis dataKey="timestamp" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            cursor={{ stroke: "var(--color-border)" }}
            contentStyle={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-chart-tooltip)",
              color: "var(--color-text-primary)",
              fontSize: "0.75rem",
            }}
            labelFormatter={formatTooltipDate}
            formatter={(value) => [formatTooltipValue(value), label]}
          />
          <Line type="monotone" dataKey={dataKey} name={label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

