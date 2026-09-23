import clsx from "clsx";

export default function TopMoversWidget({ movers = [], title = "Top movers" }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)] shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2><span className="text-xs text-[var(--color-text-muted)]">24h</span></div>
      {movers.length === 0 ? <p className="text-sm text-[var(--color-text-muted)]">No movers available</p> : <ul className="divide-y divide-[var(--color-border-subtle)]">{movers.map((mover) => <li key={mover.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{mover.name}</p><p className="text-xs uppercase text-[var(--color-text-muted)]">{mover.symbol}</p></div><span className={clsx("shrink-0 font-tabular text-sm", mover.change >= 0 ? "text-[var(--color-up)]" : "text-[var(--color-down)]")}>{mover.change >= 0 ? "+" : ""}{mover.change.toFixed(2)}%</span></li>)}</ul>}
    </section>
  );
}