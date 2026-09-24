"use client";

import clsx from "clsx";

const VARIANTS = {
  primary: "bg-[var(--color-accent)] text-white hover:opacity-90",
  secondary: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
  outline: "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]",
  ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
  destructive: "bg-[var(--color-down)] text-white hover:opacity-90",
};

const SIZES = {
  sm: "min-h-8 px-3 py-1 text-xs",
  md: "min-h-9 px-3.5 py-2 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-base",
  icon: "size-9",
};

/** @param {{ variant?: string, size?: string, loading?: boolean, disabled?: boolean, type?: "button" | "submit" | "reset", children?: import("react").ReactNode, className?: string, [key: string]: any }} props */
export default function Button({ variant = "primary", size = "md", loading = false, disabled = false, type = "button", children = null, className = undefined, ...props }) {
  return (
    <button
      {...props}
      type={type}
      aria-busy={loading ? "true" : undefined}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-colors active:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      )}
    >
      <span aria-hidden="true" className={clsx("size-4", loading ? "animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" : "invisible")} />
      {children}
    </button>
  );
}