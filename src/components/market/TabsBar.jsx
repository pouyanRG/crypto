"use client";

const DEFAULT_TABS = [{ value: "all", label: "All" }, { value: "gainers", label: "Top Gainers" }, { value: "losers", label: "Top Losers" }, { value: "trending", label: "Trending" }];

export default function TabsBar({ active = "all", onChange, tabs = DEFAULT_TABS }) {
  return <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)]">{tabs.map((tab) => <button key={tab.value} type="button" role="tab" aria-selected={active === tab.value} onClick={() => onChange?.(tab.value)} className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${active === tab.value ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}>{tab.label}</button>)}</div>;
}