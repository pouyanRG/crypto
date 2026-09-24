import Badge from "../ui/Badge";

const LABELS = { live: "Live", updating: "Updating", cached: "Cached", stale: "Stale data", offline: "Offline", unavailable: "API unavailable" };
const VARIANTS = { live: "up", updating: "neutral", cached: "neutral", stale: "neutral", offline: "down", unavailable: "down" };

/** @param {{ status?: "live" | "updating" | "cached" | "stale" | "offline" | "unavailable" | string }} props */
export default function DataSourceStatus({ status = "cached" }) {
  const label = LABELS[status] ?? LABELS.cached;

  return <Badge variant={VARIANTS[status] ?? VARIANTS.cached} aria-label={`Data source status: ${label}`}>{label}</Badge>;
}