import Link from "next/link";
import Nav from "./Nav";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-base font-semibold text-[var(--color-text-primary)]"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-sm text-white">
            ₿
          </span>
          Crypto Analytics
        </Link>
        <Nav />
      </div>
    </header>
  );
}