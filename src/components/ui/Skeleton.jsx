import clsx from "clsx";

export default function Skeleton({ className }) {
  return <div className={clsx("animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-hover)]", className)} />;
}