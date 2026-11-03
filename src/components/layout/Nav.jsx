"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, isActivePath } from "./navLinks";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="hidden md:block">
      <ul className="flex items-center gap-0.5">
        {NAV_LINKS.map((link) => {
          const isActive = isActivePath(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-2 text-sm font-medium transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.98] lg:px-3",
                  isActive
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}