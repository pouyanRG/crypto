import Badge from "../ui/Badge";

const LABELS = { live: "Live", updating: "Updating", cached: "Cached", stale: "Stale data", offline: "Offline", unavailable: "API unavailable" };
const VARIANTS = { live: "up", updating: "neutral", cached: "neutral", stale: "neutral", offline: "down", unavailable: "down" };
const DOT_COLORS = { up: "bg-[var(--color-up)]", down: "bg-[var(--color-down)]", neutral: "bg-[var(--color-neutral)]" };

/** @param {{ status?: "live" | "updating" | "cached" | "stale" | "offline" | "unavailable" | string, compact?: boolean }} props */
export default function DataSourceStatus({ status = "cached", compact = false }) {
  const label = LABELS[status] ?? LABELS.cached;
  const variant = VARIANTS[status] ?? VARIANTS.cached;

  if (compact) {
    return <span role="status" aria-label={`Data source status: ${label}`} title={label} className={`inline-block size-2.5 rounded-full ${DOT_COLORS[variant]}`} />;
  }

  return <Badge variant={variant} aria-label={`Data source status: ${label}`}>{label}</Badge>;
}