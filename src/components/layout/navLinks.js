export const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/market", label: "Markets", icon: "markets" },
  { href: "/watchlist", label: "Watchlist", icon: "watchlist" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/compare", label: "Compare", icon: "compare" },
];

export function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}