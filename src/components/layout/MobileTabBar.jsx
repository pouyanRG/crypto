"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavIcon from "./NavIcon";
import { NAV_LINKS, isActivePath } from "./navLinks";

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="grid grid-cols-5">
        {NAV_LINKS.map((link) => {
          const isActive = isActivePath(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "mx-0.5 flex h-14 flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] text-[11px] font-medium transition-[background-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-accent)] active:scale-[0.98]",
                  isActive ? "bg-[var(--color-accent-muted)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <NavIcon name={link.icon} />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}