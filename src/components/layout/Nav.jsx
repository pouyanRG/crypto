"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [{ href: "/", label: "Dashboard" }, { href: "/market", label: "Markets" }, { href: "/watchlist", label: "Watchlist" }, { href: "/compare", label: "Compare" }];

export default function Nav() {
  const pathname = usePathname();
  return <nav className="flex items-center gap-1 overflow-x-auto">{LINKS.map((link) => { const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href); return <Link key={link.href} href={link.href} className={clsx("shrink-0 rounded-[var(--radius-md)] px-3 py-1.5 text-sm font-medium transition-colors", isActive ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]")}>{link.label}</Link>; })}</nav>;
}