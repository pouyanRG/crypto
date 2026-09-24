import clsx from "clsx";

const VARIANTS = { text: "h-4 w-full", avatar: "size-10 rounded-full", row: "h-10 w-full", card: "h-32 w-full" };

/** @param {{ variant?: string, className?: string, [key: string]: any }} props */
export default function Skeleton({ variant, className, ...props }) {
  return <div aria-hidden="true" className={clsx("animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-hover)] motion-reduce:animate-none", variant && VARIANTS[variant], className)} {...props} />;
}