import clsx from "clsx";

const VARIANTS = { up: "bg-[var(--color-up-muted)] text-[var(--color-up)]", down: "bg-[var(--color-down-muted)] text-[var(--color-down)]", neutral: "bg-[var(--color-accent-muted)] text-[var(--color-text-secondary)]" };

export function changeVariant(value) { if (value > 0) return "up"; if (value < 0) return "down"; return "neutral"; }

export default function Badge({ variant = "neutral", children, className, ...props }) {
  return <span className={clsx("inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium font-tabular", VARIANTS[variant] ?? VARIANTS.neutral, className)} {...props}>{children}</span>;
}