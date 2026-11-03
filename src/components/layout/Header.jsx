import Link from "next/link";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
import LiveDataSourceStatus from "./LiveDataSourceStatus";

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent)] p-1.5 text-white">
      <path d="M7 18.5 15.2 7l4.8 4.9 5 6.2-2.3.1-3.8-4.5-3.2 3.1-3.9-4.2-4.8 6.4H7Z" fill="currentColor" opacity="0.95" />
    </svg>
  );
}

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 px-4 sm:px-6"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 px-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:px-6 md:h-16 md:gap-2 lg:gap-4">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-[var(--radius-md)] text-sm font-semibold tracking-[-0.02em] text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] sm:text-base"
        >
          <BrandMark />
          <span className="whitespace-nowrap tracking-[-0.02em]">
            Northstar<span className="hidden lg:inline"> Ledger</span>
          </span>
        </Link>
        <Nav />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LiveDataSourceStatus />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}