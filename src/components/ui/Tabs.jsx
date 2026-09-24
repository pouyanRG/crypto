"use client";

import clsx from "clsx";

/** @param {{ tabs?: Array<{ value: string, label: import("react").ReactNode, disabled?: boolean, panelId?: string }>, active?: string, onChange?: (value: string) => void, className?: string, id?: string, ariaLabel?: string, panelId?: string, activationMode?: "automatic" | "manual" }} props */
export default function Tabs({ tabs = [], active, onChange, className = undefined, id = "tabs", ariaLabel = "Options", panelId, activationMode = "manual" }) {
  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const activeValue = enabledTabs.some((tab) => tab.value === active) ? active : enabledTabs[0]?.value;

  const moveFocus = (event, index) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || enabledTabs.length === 0) return;
    event.preventDefault();
    const current = Math.max(0, enabledTabs.findIndex((tab) => tab.value === tabs[index]?.value));
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? enabledTabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + enabledTabs.length) % enabledTabs.length;
    const nextTab = enabledTabs[nextIndex];
    document.getElementById(`${id}-${nextTab.value}`)?.focus();
    if (activationMode === "automatic") onChange?.(nextTab.value);
  };

  return <div role="tablist" aria-label={ariaLabel} className={clsx("inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[var(--radius-pill)] bg-[var(--color-bg-elevated)] p-1", className)}>{tabs.map((tab, index) => {
    const isActive = tab.value === activeValue;
    const tabId = `${id}-${tab.value}`;
    const controlledPanelId = tab.panelId ?? (panelId ? `${panelId}-${tab.value}` : `${tabId}-panel`);
    return <button key={tab.value} id={tabId} type="button" role="tab" tabIndex={isActive ? 0 : -1} aria-selected={isActive} aria-controls={controlledPanelId} disabled={tab.disabled} onClick={() => onChange?.(tab.value)} onKeyDown={(event) => moveFocus(event, index)} className={clsx("shrink-0 rounded-[var(--radius-pill)] px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-50", isActive ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")}>{tab.label}</button>;
  })}</div>;
}

/** @param {{ id: string, tabValue: string, tabId?: string, active?: boolean, children?: import("react").ReactNode, className?: string }} props */
export function TabPanel({ id, tabValue, tabId = `${id}-${tabValue}`, active = false, children = null, className = undefined }) {
  return <div id={id} role="tabpanel" aria-labelledby={tabId} hidden={!active} tabIndex={0} className={className}>{active && children}</div>;
}
