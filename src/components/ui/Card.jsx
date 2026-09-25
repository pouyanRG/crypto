import clsx from "clsx";

const VARIANTS = {
  default: "border border-[var(--color-border)] bg-[var(--color-surface)]",
  elevated: "border border-[var(--color-border)] bg-[var(--color-bg-elevated)]",
  outlined: "border border-[var(--color-border)] bg-transparent",
  interactive: "border border-[var(--color-border)] bg-[var(--color-surface)] transition-[background-color,border-color,transform] duration-150 ease-[var(--ease-standard)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:translate-y-px",
  compact: "border border-[var(--color-border)] bg-[var(--color-surface)] p-3",
};

/** @param {{ as?: import("react").ElementType, variant?: string, className?: string, children?: import("react").ReactNode, onClick?: (event: import("react").KeyboardEvent | import("react").MouseEvent) => void, [key: string]: any }} props */
export default function Card({ as: Component = "div", variant = "default", className = undefined, children = null, onClick, ...props }) {
  const interactive = variant === "interactive" && Boolean(onClick) && Component === "div";
  const handleKeyDown = (event) => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onClick(event); } };
  return <Component {...props} onClick={onClick} onKeyDown={interactive ? handleKeyDown : props.onKeyDown} role={interactive ? "button" : props.role} tabIndex={interactive ? 0 : props.tabIndex} className={clsx("rounded-[var(--radius-card)] p-[var(--space-card-padding)]", VARIANTS[variant] ?? VARIANTS.default, interactive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]", className)}>{children}</Component>;
}