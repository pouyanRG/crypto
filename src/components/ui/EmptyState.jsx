import Button from "./Button";

/** @param {{ title: string, description?: string, actionLabel?: string, onAction?: () => void, children?: import("react").ReactNode }} props */
export default function EmptyState({ title, description = undefined, actionLabel = undefined, onAction = undefined, children = null }) {
  return <section className="grid justify-items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-[var(--space-card-padding)] text-center" aria-live="polite">
    {children}
    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
    {description && <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>}
    {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
  </section>;
}