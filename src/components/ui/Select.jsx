import clsx from "clsx";

/** @param {{ id: string, label?: string, placeholder?: string, helperText?: string, error?: string, required?: boolean, children?: import("react").ReactNode, className?: string, [key: string]: any }} props */
export default function Select({ id, label, placeholder = undefined, helperText = undefined, error = undefined, required = false, children = null, className = undefined, ...props }) {
  const messageId = `${id}-message`;
  return <div className="grid gap-1.5">
    {label && <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-primary)]">{label}{required && <span aria-hidden="true"> *</span>}</label>}
    <select {...props} id={id} required={required} aria-invalid={Boolean(error)} aria-describedby={props["aria-describedby"] || (helperText || error ? messageId : undefined)} className={clsx("min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors focus-visible:border-[var(--color-accent)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-muted)] disabled:cursor-not-allowed disabled:opacity-50", error && "border-[var(--color-down)]", className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
    {(error || helperText) && <p id={messageId} className={clsx("text-xs", error ? "text-[var(--color-down)]" : "text-[var(--color-text-secondary)]")} role={error ? "alert" : undefined}>{error || helperText}</p>}
  </div>;
}