export const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/market", label: "Markets", icon: "markets" },
  { href: "/discover", label: "Discover", icon: "discover" },
  { href: "/compare", label: "Compare", icon: "compare" },
  { href: "/portfolio", label: "Portfolio", icon: "portfolio" },
  { href: "/watchlist", label: "Watchlist", icon: "watchlist" },
];

export function isActivePath(pathname, href) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}