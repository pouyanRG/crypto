import Link from "next/link";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
import LiveDataSourceStatus from "./LiveDataSourceStatus";

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 rounded-[var(--radius-md)] bg-[var(--color-accent)] p-1.5 text-white shadow-sm">
      <path d="M7 18.5 15.2 7l4.8 4.9 5 6.2-2.3.1-3.8-4.5-3.2 3.1-3.9-4.2-4.8 6.4H7Z" fill="currentColor" opacity="0.95" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3 text-base font-semibold text-[var(--color-text-primary)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
          <BrandMark />
          <span className="tracking-[-0.02em]">Northstar Ledger</span>
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