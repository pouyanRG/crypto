import Card from "../ui/Card";
import NavIcon from "../layout/NavIcon";
import Skeleton from "../ui/Skeleton";

export default function DiscoverStatCard({ icon, value, label, loading = false }) {
  return (
    <Card as="div" variant="default" className="flex min-w-0 items-center gap-2 p-3 sm:gap-4 sm:p-4">
      <div className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] sm:flex">
        <NavIcon name={icon} className="size-4 sm:size-6" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="break-words font-tabular text-base font-semibold text-[var(--color-text-primary)] sm:text-2xl">{value}</div>
        )}
        <div className="mt-1 text-xs leading-4 text-[var(--color-text-secondary)] sm:text-sm">{label}</div>
      </div>
    </Card>
  );
}
