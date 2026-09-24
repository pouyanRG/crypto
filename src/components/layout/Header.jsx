import Link from "next/link";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
import DataSourceStatus from "./DataSourceStatus";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-sm text-white" aria-hidden="true">B</span>
          Crypto Analytics
        </Link>
        <Nav />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <DataSourceStatus />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}