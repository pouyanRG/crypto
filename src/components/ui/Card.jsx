import clsx from "clsx";

const VARIANTS = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]",
  elevated: "border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-[var(--shadow-card)]",
  outlined: "border-[var(--color-border)] bg-transparent shadow-none",
  interactive: "border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]",
  compact: "border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-none",
};

/** @param {{ as?: import("react").ElementType, variant?: string, className?: string, children?: import("react").ReactNode, onClick?: (event: import("react").KeyboardEvent | import("react").MouseEvent) => void, [key: string]: any }} props */
export default function Card({ as: Component = "div", variant = "default", className = undefined, children = null, onClick, ...props }) {
  const interactive = variant === "interactive" && Boolean(onClick) && Component === "div";
  const handleKeyDown = (event) => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(event); } };
  return <Component {...props} onClick={onClick} onKeyDown={interactive ? handleKeyDown : props.onKeyDown} role={interactive ? "button" : props.role} tabIndex={interactive ? 0 : props.tabIndex} className={clsx("rounded-[var(--radius-card)] border p-[var(--space-card-padding)]", VARIANTS[variant] ?? VARIANTS.default, interactive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]", className)}>{children}</Component>;
}