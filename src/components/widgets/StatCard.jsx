import clsx from "clsx";

export default function StatCard({ label, value, change, changeLabel = "24h", className }) {
  const changeClass = change > 0
    ? "text-[var(--color-up)]"
    : change < 0
      ? "text-[var(--color-down)]"
      : "text-[var(--color-text-muted)]";

  return (
    <article className={clsx(
      "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)] shadow-[var(--shadow-card)]",
      className
    )}>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <p className="font-tabular text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
        {change !== undefined && (
          <span className={clsx("font-tabular text-sm font-medium", changeClass)}>
            {change > 0 ? "+" : ""}{change.toFixed(2)}% <span className="text-[var(--color-text-muted)]">{changeLabel}</span>
          </span>
        )}
      </div>
    </article>
  );
}