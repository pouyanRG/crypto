"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../ui/Card";

const formatValue = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 }).format(value);

export default function LineChartWidget({ title = "Market trend", data = [], dataKey = "value", xKey = "label" }) {
  return (
    <Card as="section">
      <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2><span className="text-xs text-[var(--color-text-muted)]">USD</span></div>
      <div className="h-64 w-full">
        {data.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">No chart data available</div> : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs><linearGradient id="market-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.32} /><stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} /></linearGradient></defs>
              <XAxis dataKey={xKey} hide /><YAxis hide domain={["auto", "auto"]} /><Tooltip formatter={(value) => formatValue(value)} />
              <Area type="monotone" dataKey={dataKey} stroke="var(--color-accent)" fill="url(#market-area)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}