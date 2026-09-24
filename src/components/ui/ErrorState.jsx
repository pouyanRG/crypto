import Button from "./Button";

/** @param {{ title?: string, description?: string, actionLabel?: string, onRetry?: () => void, stale?: boolean, staleLabel?: string }} props */
export default function ErrorState({ title = "Something went wrong", description = "We could not load this data right now.", actionLabel = "Try again", onRetry = undefined, stale = false, staleLabel = "Showing previously loaded data" }) {
  return <section className="grid justify-items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-down-muted)] bg-[var(--color-down-muted)] p-[var(--space-card-padding)] text-center" role="alert">
    <p className="text-sm font-semibold text-[var(--color-down)]">Error</p>
    <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
    <p className="max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
    {stale && <p role="status" className="text-xs text-[var(--color-text-secondary)]">{staleLabel}</p>}
    {onRetry && <Button variant="outline" onClick={onRetry}>{actionLabel}</Button>}
  </section>;
}