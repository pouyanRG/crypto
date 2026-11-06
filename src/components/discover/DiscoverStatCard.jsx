import Card from "../ui/Card";
import NavIcon from "../layout/NavIcon";
import Skeleton from "../ui/Skeleton";

export default function DiscoverStatCard({ icon, value, label, loading = false }) {
  return (
    <Card as="div" variant="default" className="flex min-w-0 items-center gap-2 !p-2 sm:gap-4 sm:!p-4">
      <div className="hidden size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] sm:flex">
        <NavIcon name={icon} className="size-4 sm:size-6" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <Skeleton className="h-5 w-16 sm:h-8 sm:w-24" />
        ) : (
          <div className="break-words font-tabular text-[11px] font-semibold text-[var(--color-text-primary)] sm:text-2xl">{value}</div>
        )}
        <div className="mt-1 text-[10px] leading-3 text-[var(--color-text-secondary)] sm:text-sm sm:leading-5">{label}</div>
      </div>
    </Card>
  );
}
