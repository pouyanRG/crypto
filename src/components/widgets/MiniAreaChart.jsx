"use client";

import { Area, AreaChart, YAxis } from "recharts";

export default function MiniAreaChart({ data = [], color = "var(--color-accent)", id = "mini" }) {
  if (data.length < 2) {
    return <span className="text-xs text-[var(--color-text-muted)]">Chart unavailable</span>;
  }

  return (
    <AreaChart width={140} height={56} data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <YAxis hide domain={["dataMin", "dataMax"]} />
      <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${id})`} strokeWidth={2} dot={false} isAnimationActive={false} />
    </AreaChart>
  );
}