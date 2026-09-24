import clsx from "clsx";

/** @param {{ id: string, label?: string, helperText?: string, error?: string, required?: boolean, loading?: boolean, leadingIcon?: import("react").ReactNode, trailingIcon?: import("react").ReactNode, onClear?: () => void, clearLabel?: string, className?: string, [key: string]: any }} props */
export default function Input({ id, label, helperText = undefined, error = undefined, required = false, loading = false, leadingIcon = null, trailingIcon = null, onClear, clearLabel = "Clear input", className = undefined, ...props }) {
  const messageId = `${id}-message`;
  const describedBy = [props["aria-describedby"], helperText || error ? messageId : null].filter(Boolean).join(" ") || undefined;
  return <div className="grid gap-1.5">
    {label && <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">{label}{required && <span aria-hidden="true"> *</span>}</label>}
    <div className="relative">
      {leadingIcon && <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-[var(--color-text-muted)]" aria-hidden="true">{leadingIcon}</span>}
      <input {...props} id={id} required={required} aria-invalid={Boolean(error)} aria-busy={loading ? "true" : undefined} aria-describedby={describedBy} className={clsx("min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-muted)] disabled:cursor-not-allowed disabled:opacity-50", leadingIcon && "pl-10", (trailingIcon || onClear || loading) && "pr-10", error && "border-[var(--color-down)] focus-visible:ring-[var(--color-down-muted)]", className)} />
      {(trailingIcon || onClear || loading) && <span className="absolute inset-y-0 right-3 inline-flex items-center text-[var(--color-text-muted)]">{loading ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" /> : onClear ? <button type="button" aria-label={clearLabel} onClick={onClear} disabled={props.disabled || props.readOnly} className="rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]">{trailingIcon ?? "x"}</button> : trailingIcon}</span>}
    </div>
    {(error || helperText) && <p id={messageId} className={clsx("text-xs", error ? "text-[var(--color-down)]" : "text-[var(--color-text-secondary)]")} role={error ? "alert" : undefined}>{error || helperText}</p>}
  </div>;
}