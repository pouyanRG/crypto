"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["var(--color-accent)", "var(--color-up)", "#f59e0b", "#a78bfa", "var(--color-text-muted)"];

export default function PieChartWidget({ title = "Market share", data = [] }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)] shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
      {data.length === 0 ? <div className="flex h-52 items-center justify-center text-sm text-[var(--color-text-muted)]">No market share data available</div> : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-52 w-full max-w-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3}>{data.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <ul className="w-full space-y-2 text-sm">{data.map((entry, index) => <li key={entry.name} className="flex items-center justify-between gap-3 text-[var(--color-text-secondary)]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{entry.name}</span><span className="font-tabular text-[var(--color-text-primary)]">{entry.value}%</span></li>)}</ul>
        </div>
      )}
    </section>
  );
}