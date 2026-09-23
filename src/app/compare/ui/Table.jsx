import clsx from "clsx";

// wrapper با اسکرول افقی روی موبایل (طبق بند ۳ اسپک)
export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]">
      <table className={clsx("w-full border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableRow({ children, onClick, className }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        "border-t border-[var(--color-border-subtle)]",
        onClick && "cursor-pointer hover:bg-[var(--color-surface-hover)]",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, header = false }) {
  const Tag = header ? "th" : "td";
  return (
    <Tag
      className={clsx(
        "px-4 py-2 text-left whitespace-nowrap",
        header && "font-medium text-xs uppercase tracking-wide",
        className
      )}
    >
      {children}
    </Tag>
  );
}