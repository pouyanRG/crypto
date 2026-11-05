"use client";

import clsx from "clsx";

/** @param {{ tabs?: Array<{ value: string, label: import("react").ReactNode, disabled?: boolean, panelId?: string }>, active?: string, onChange?: (value: string) => void, className?: string, id?: string, ariaLabel?: string, panelId?: string, activationMode?: "automatic" | "manual", appearance?: "default" | "polished" | "bar" }} props */
export default function Tabs({ tabs = [], active, onChange, className = undefined, id = "tabs", ariaLabel = "Options", panelId, activationMode = "manual", appearance = "default" }) {
  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const activeValue = enabledTabs.some((tab) => tab.value === active) ? active : enabledTabs[0]?.value;
  const isPolished = appearance === "polished";
  const isBar = appearance === "bar";

  const moveFocus = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || enabledTabs.length === 0) return;
    event.preventDefault();
    const current = Math.max(0, enabledTabs.findIndex((tab) => tab.value === tabs[index]?.value));
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? enabledTabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + enabledTabs.length) % enabledTabs.length;
    const nextTab = enabledTabs[nextIndex];
    document.getElementById(`${id}-${nextTab.value}`)?.focus();
    if (activationMode === "automatic") onChange?.(nextTab.value);
  };

  return <div role="tablist" aria-label={ariaLabel} className={clsx(
    isBar ? "flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5" : isPolished ? "flex w-full max-w-full items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1" : "inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-[var(--radius-pill)] border border-[var(--color-border)] p-0.5",
    className,
  )}>{tabs.map((tab, index) => {
    const isActive = tab.value === activeValue;
    const tabId = `${id}-${tab.value}`;
    const controlledPanelId = tab.panelId ?? (panelId ? `${panelId}-${tab.value}` : `${tabId}-panel`);
    return <button key={tab.value} id={tabId} type="button" role="tab" tabIndex={isActive ? 0 : -1} aria-selected={isActive} aria-controls={controlledPanelId} disabled={tab.disabled} onClick={() => onChange?.(tab.value)} onKeyDown={(event) => moveFocus(event, index)} className={clsx(
      "min-h-11 shrink-0 inline-flex items-center gap-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50",
      isBar ? "rounded-[var(--radius-lg)] px-4 transition-colors duration-200" : isPolished ? "min-w-0 flex-1 rounded-[var(--radius-md)] px-2 py-2 text-sm leading-none tracking-[-0.01em] transition-[background-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.99]" : "rounded-[var(--radius-pill)] px-4 transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.98]",
      isActive ? (isBar ? "bg-[var(--color-surface-hover)] text-[var(--color-text-primary)]" : "bg-[var(--color-accent)] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]") : (isBar ? "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]")
    )}>{tab.label}</button>;
  })}</div>;
}

/** @param {{ id: string, tabValue: string, tabId?: string, active?: boolean, children?: import("react").ReactNode, className?: string }} props */
export function TabPanel({ id, tabValue, tabId = `${id}-${tabValue}`, active = false, children = null, className = undefined }) {
  return <div id={id} role="tabpanel" aria-labelledby={tabId} hidden={!active} tabIndex={0} className={className}>{active && children}</div>;
}
