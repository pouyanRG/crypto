import Link from "next/link";
import Nav from "./Nav";
import NavIcon from "./NavIcon";
import ThemeSwitcher from "./ThemeSwitcher";
import LiveDataSourceStatus from "./LiveDataSourceStatus";

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent)] p-1.5 text-white">
      <path d="M7 18.5 15.2 7l4.8 4.9 5 6.2-2.3.1-3.8-4.5-3.2 3.1-3.9-4.2-4.8 6.4H7Z" fill="currentColor" opacity="0.95" />
    </svg>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-up-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-up)]">
      <span className="size-1.5 rounded-full bg-[var(--color-up)]" aria-hidden="true" />
      Live
    </span>
  );
}

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 md:h-16 md:gap-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-[-0.02em] text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          <BrandMark />
          <span className="truncate tracking-[-0.02em]">Northstar Ledger</span>
        </Link>
        <LiveBadge />
        <Nav />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LiveDataSourceStatus />
          <ThemeSwitcher />
          <button
            type="button"
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] md:hidden"
          >
            <NavIcon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}