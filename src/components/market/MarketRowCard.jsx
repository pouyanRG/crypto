import Link from "next/link";
import Sparkline from "./Sparkline";
import Button from "../ui/Button";
import Badge, { changeVariant } from "../ui/Badge";
import { formatCompact, formatPercent, formatPrice } from "../../lib/formatters";

export default function MarketRowCard({ coin, isWatchlisted = false, onToggleWatchlist, onSelect }) {
  const href = `/coin/${coin.id}`;
  const change24h = coin.price_change_percentage_24h;

  return (
    <li className="border-b border-[var(--color-border-subtle)] last:border-0">
      <div className="flex items-center gap-3 py-3">
        <Link
          href={href}
          onClick={() => onSelect?.(coin)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          <span className="w-5 shrink-0 text-right font-tabular text-xs text-[var(--color-text-muted)]">
            {coin.market_cap_rank ?? "-"}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">
            {coin.symbol?.slice(0, 3).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">{coin.name}</span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <span className="uppercase">{coin.symbol}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="font-tabular">{formatCompact(coin.market_cap)}</span>
            </span>
          </span>
        </Link>

        <span className="shrink-0">
          <Sparkline
            data={coin.sparkline_in_7d?.price?.map((value) => ({ value }))}
            positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0}
          />
        </span>

        <span className="shrink-0 text-right">
          <span className="block font-tabular text-sm font-medium text-[var(--color-text-primary)]">
            {formatPrice(coin.current_price)}
          </span>
          <Badge variant={changeVariant(change24h)} className="mt-1">
            {formatPercent(change24h)}
          </Badge>
        </span>

        <Button
          size="icon"
          variant="ghost"
          aria-label={`${isWatchlisted ? "Remove" : "Add"} ${coin.name} ${isWatchlisted ? "from" : "to"} watchlist`}
          aria-pressed={isWatchlisted}
          onClick={() => onToggleWatchlist?.(coin)}
          className={`shrink-0 text-lg ${isWatchlisted ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
        >
          {isWatchlisted ? "★" : "☆"}
        </Button>
      </div>
    </li>
  );
}
