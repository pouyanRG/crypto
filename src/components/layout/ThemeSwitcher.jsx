"use client";

import NavIcon from "./NavIcon";
import { useAppStore } from "../../lib/store/useAppStore";

export default function ThemeSwitcher({ compact = false, onAction = undefined }) {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      role={compact ? "menuitem" : undefined}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className={compact
        ? "inline-flex min-h-11 w-full items-center justify-start gap-3 rounded-[var(--radius-md)] px-3 text-sm font-medium text-[var(--color-text-secondary)] transition-[background-color,color,transform] duration-200 hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"
        : "inline-flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98]"}
      onClick={() => {
        setTheme(nextTheme);
        onAction?.();
      }}
    >
      <NavIcon name={theme === "dark" ? "sun" : "moon"} />
      {compact && <span>{nextTheme === "light" ? "Light theme" : "Dark theme"}</span>}
    </button>
  );
}