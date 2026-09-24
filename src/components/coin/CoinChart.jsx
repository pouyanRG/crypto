"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Tabs from "../ui/Tabs";

const RANGES = ["24h", "7d", "30d", "1y"];

export default function CoinChart({ data = [], range = "24h", onRangeChange, title = "Price history" }) {
  return <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)]"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold text-[var(--color-text-primary)]">{title}</h2><Tabs id="coin-chart-ranges" ariaLabel="Chart timeframe" tabs={RANGES.map((value) => ({ value, label: value }))} active={range} onChange={onRangeChange} activationMode="automatic" panelId="coin-chart-panel" /></div><div id={`coin-chart-panel-${range}`} role="tabpanel" aria-labelledby={`coin-chart-ranges-${range}`} className="h-72" tabIndex={0}>{data.length < 2 ? <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">No price history available</div> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="coin-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="timestamp" hide /><YAxis hide domain={["auto", "auto"]} /><Tooltip /><Area type="monotone" dataKey="price" stroke="var(--color-accent)" fill="url(#coin-area)" strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer>}</div></section>;
}