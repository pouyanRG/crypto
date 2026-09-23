"use client";

import clsx from "clsx";

const VARIANTS = {
  primary: "bg-[var(--color-accent)] text-white hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]",
  outline:
    "bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
};

export default function Button({ variant = "primary", className, children, ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        VARIANTS[variant] ?? VARIANTS.primary,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}