import clsx from "clsx";

export default function Card({ as: Component = "div", className, children, ...props }) {
  return <Component className={clsx("rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-card-padding)] shadow-[var(--shadow-card)]", className)} {...props}>{children}</Component>;
}