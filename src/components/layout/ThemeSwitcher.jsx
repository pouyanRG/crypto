"use client";

import NavIcon from "./NavIcon";
import { useAppStore } from "../../lib/store/useAppStore";

export default function ThemeSwitcher() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="inline-flex size-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      onClick={() => setTheme(nextTheme)}
    >
      <NavIcon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}