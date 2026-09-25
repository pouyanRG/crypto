import clsx from "clsx";
import Button from "./Button";

/** @param {{ children?: import("react").ReactNode, className?: string, caption?: string, ariaLabel?: string, minWidth?: string }} props */
export function Table({ children = null, className = undefined, caption = undefined, ariaLabel, minWidth = undefined }) { return <div className="w-full overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]"><table aria-label={ariaLabel} style={minWidth ? { minWidth } : undefined} className={clsx("w-full border-collapse text-sm", className)}>{caption && <caption className="sr-only">{caption}</caption>}{children}</table></div>; }
/** @param {{ children?: import("react").ReactNode }} props */
export function TableHead({ children = null }) { return <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"><tr>{children}</tr></thead>; }
export const TableHeader = TableHead;
export function TableCaption({ children }) { return <caption className="px-4 py-2 text-left text-xs text-[var(--color-text-secondary)]">{children}</caption>; }
/** @param {{ children?: import("react").ReactNode, className?: string }} props */
export function TableBody({ children = null, className = undefined }) { return <tbody className={className}>{children}</tbody>; }
export function TableEmpty({ children = "No data available", colSpan = 1 }) { return <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">{children}</td></tr>; }
export function TableLoading({ children = "Loading", colSpan = 1 }) { return <tr aria-busy="true"><td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">{children}</td></tr>; }
/** @param {{ children?: string, colSpan?: number, onRetry?: () => void }} props */
export function TableError({ children = "Unable to load data", colSpan = 1, onRetry }) { return <tr><td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-[var(--color-down)]">{children}{onRetry && <span className="ml-3 inline-block"><Button size="sm" variant="outline" onClick={onRetry}>Try again</Button></span>}</td></tr>; }
/** @param {{ children?: import("react").ReactNode, onClick?: (event: import("react").KeyboardEvent | import("react").MouseEvent) => void, className?: string, selected?: boolean }} props */
export function TableRow({ children = null, onClick = undefined, className = undefined, selected = false }) {
	const interactive = Boolean(onClick);
	const handleKeyDown = (event) => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(event); } };
	return <tr onClick={onClick} onKeyDown={handleKeyDown} tabIndex={interactive ? 0 : undefined} aria-selected={selected || undefined} className={clsx("border-t border-[var(--color-border-subtle)]", interactive && "cursor-pointer hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)]", selected && "bg-[var(--color-surface-hover)]", className)}>{children}</tr>;
}
/** @param {{ children?: import("react").ReactNode, className?: string, header?: boolean, scope?: string, numeric?: boolean }} props */
export function TableCell({ children = null, className = undefined, header = false, scope = undefined, numeric = false, ariaSort = undefined }) { const Tag = header ? "th" : "td"; return <Tag scope={header ? scope ?? "col" : undefined} aria-sort={ariaSort} className={clsx("whitespace-nowrap px-4 py-2 text-left", numeric && "font-tabular text-right", header && "text-xs font-medium uppercase tracking-wide", className)}>{children}</Tag>; }