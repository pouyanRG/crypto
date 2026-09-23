import clsx from "clsx";

export default function Card({ as: Component = "div", className, children, ...props }) {
  return (
    <Component
      className={clsx(
        "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] p-[var(--space-card-padding)]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}