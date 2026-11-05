import { formatPercent } from "../../lib/formatters";
import NavIcon from "../layout/NavIcon";
import Skeleton from "../ui/Skeleton";

export default function ChangeCell({ value, loading = false }) {
  if (loading) return <Skeleton className="h-4 w-14" />;
  if (value == null || Number.isNaN(value)) {
    return <span className="text-sm text-[var(--color-text-muted)]">—</span>;
  }

  const tone = value > 0 ? "text-[var(--color-up)]" : value < 0 ? "text-[var(--color-down)]" : "text-[var(--color-text-muted)]";
  const icon = value > 0 ? "arrowUp" : value < 0 ? "arrowDown" : null;

  return (
    <span className={`inline-flex items-center gap-1 font-tabular text-sm ${tone}`}>
      {icon && <NavIcon name={icon} className="size-3.5" />}
      {formatPercent(value)}
    </span>
  );
}
