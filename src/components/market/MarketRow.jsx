import Link from "next/link";
import Sparkline from "./Sparkline";

const formatCurrency = (value) => value == null ? "-" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value < 1 ? 6 : 2 }).format(value);
const formatCompact = (value) => value == null ? "-" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);

function Change({ value }) {
  return <span className={value > 0 ? "text-[var(--color-up)]" : value < 0 ? "text-[var(--color-down)]" : "text-[var(--color-text-muted)]"}>{value == null ? "-" : `${value > 0 ? "+" : ""}${value.toFixed(2)}%`}</span>;
}

export default function MarketRow({ coin, isWatchlisted = false, onToggleWatchlist, onSelect }) {
  const href = `/coin/${coin.id}`;
  return (
    <tr className="border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-hover)]">
      <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-muted)]">{coin.market_cap_rank ?? "-"}</td>
      <td className="min-w-48 px-4 py-3"><Link href={href} onClick={() => onSelect?.(coin)} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">{coin.symbol?.slice(0, 3).toUpperCase()}</span><span className="min-w-0"><span className="block truncate font-medium text-[var(--color-text-primary)]">{coin.name}</span><span className="block text-xs uppercase text-[var(--color-text-muted)]">{coin.symbol}</span></span></Link></td>
      <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-primary)]">{formatCurrency(coin.current_price)}</td>
      <td className="px-4 py-3 text-right font-tabular"><Change value={coin.price_change_percentage_1h_in_currency} /></td>
      <td className="px-4 py-3 text-right font-tabular"><Change value={coin.price_change_percentage_24h} /></td>
      <td className="px-4 py-3 text-right font-tabular"><Change value={coin.price_change_percentage_7d_in_currency} /></td>
      <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.total_volume)}</td>
      <td className="px-4 py-3 text-right font-tabular text-[var(--color-text-secondary)]">{formatCompact(coin.market_cap)}</td>
      <td className="px-4 py-3"><Sparkline data={coin.sparkline_in_7d?.price?.map((value) => ({ value }))} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} /></td>
      <td className="px-4 py-3 text-center"><button type="button" aria-label={`${isWatchlisted ? "Remove" : "Add"} ${coin.name} ${isWatchlisted ? "from" : "to"} watchlist`} aria-pressed={isWatchlisted} onClick={() => onToggleWatchlist?.(coin)} className="text-lg text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)] aria-pressed:text-[var(--color-accent)]">{isWatchlisted ? "★" : "☆"}</button></td>
    </tr>
  );
}