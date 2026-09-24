import clsx from "clsx";

const VARIANTS = { up: "bg-[var(--color-up-muted)] text-[var(--color-up)]", down: "bg-[var(--color-down-muted)] text-[var(--color-down)]", neutral: "bg-[var(--color-neutral-muted)] text-[var(--color-neutral)]" };

export function changeVariant(value) { if (value > 0) return "up"; if (value < 0) return "down"; return "neutral"; }

export default function Badge({ variant = "neutral", children, className, "aria-label": ariaLabel, ...props }) {
  const resolvedVariant = VARIANTS[variant] ? variant : "neutral";
  return <span className={clsx("inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-xs font-medium font-tabular", VARIANTS[resolvedVariant], className)} aria-label={ariaLabel} {...props}>{children}</span>;
}