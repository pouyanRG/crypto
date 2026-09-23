"use client";

import clsx from "clsx";

// tabs: [{ value: "all", label: "All" }, ...]
export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div
      role="tablist"
      className={clsx(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-bg-elevated)] p-1 overflow-x-auto",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={clsx(
              "shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}