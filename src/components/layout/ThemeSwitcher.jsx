"use client";

import Button from "../ui/Button";
import { useAppStore } from "../../lib/store/useAppStore";

export default function ThemeSwitcher() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      variant="secondary"
      size="sm"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="min-h-10 rounded-[var(--radius-md)] px-3"
      onClick={() => setTheme(nextTheme)}
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  );
}