import clsx from "clsx";
import Badge, { changeVariant } from "../ui/Badge";

export default function StatCard({ label, value, change, changeLabel = "24h", className }) {
  return (
    <article className={clsx(
      "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)] shadow-[var(--shadow-card)]",
      className
    )}>
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <p className="font-tabular text-2xl font-semibold text-[var(--color-text-primary)]">{value}</p>
        {change !== undefined && (
          <Badge variant={changeVariant(change)} className="font-medium">
            {change > 0 ? "+" : ""}{change.toFixed(2)}% <span className="text-[var(--color-text-secondary)]">{changeLabel}</span>
          </Badge>
        )}
      </div>
    </article>
  );
}