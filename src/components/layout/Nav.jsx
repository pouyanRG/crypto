"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [{ href: "/", label: "Dashboard" }, { href: "/market", label: "Markets" }, { href: "/watchlist", label: "Watchlist" }, { href: "/portfolio", label: "Portfolio" }, { href: "/compare", label: "Compare" }];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="order-3 min-w-0 basis-full overflow-x-auto sm:order-none sm:basis-auto">
      <div className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]/80 p-1 backdrop-blur-sm">
        {LINKS.map((link) => {
          const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "inline-flex min-h-10 shrink-0 items-center rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                isActive
                  ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}