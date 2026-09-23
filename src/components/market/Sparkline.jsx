"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

export default function Sparkline({ data = [], positive = true }) {
  if (data.length < 2) return <span className="text-xs text-[var(--color-text-muted)]">-</span>;

  return (
    <div className="h-8 w-24" aria-label={positive ? "Positive trend" : "Negative trend"}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="value" stroke={positive ? "var(--color-up)" : "var(--color-down)"} fill="none" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}