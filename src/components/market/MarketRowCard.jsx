import Image from "next/image";
import Link from "next/link";
import Sparkline from "./Sparkline";
import Badge, { changeVariant } from "../ui/Badge";
import { formatCompact, formatPercent, formatPrice } from "../../lib/formatters";

export default function MarketRowCard({ coin, isWatchlisted = false, onToggleWatchlist, onSelect }) {
  const change24h = coin.price_change_percentage_24h;
  const trend = coin.sparkline_in_7d?.price?.map((value) => ({ value }));

  return (
    <li className="border-b border-[var(--color-border-subtle)] last:border-0 [contain-intrinsic-size:auto_68px] [content-visibility:auto]">
      <div className="flex items-center gap-1">
        <Link
          href={`/coin/${coin.id}`}
          onClick={() => onSelect?.(coin)}
          className="grid min-w-0 flex-1 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-[var(--radius-md)] py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] min-[420px]:grid-cols-[2.25rem_minmax(0,1fr)_4rem_auto]"
        >
          {coin.image ? (
            <Image src={coin.image} alt="" width={36} height={36} className="size-9 rounded-full" />
          ) : (
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">
              {coin.symbol?.slice(0, 3).toUpperCase()}
            </span>
          )}

          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">{coin.name}</span>
            <span className="block truncate text-xs text-[var(--color-text-muted)]">
              <span className="font-tabular">#{coin.market_cap_rank ?? "–"}</span>
              <span aria-hidden="true"> · </span>
              <span className="uppercase">{coin.symbol}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-tabular">{formatCompact(coin.market_cap)}</span>
            </span>
          </span>

          <span className="hidden min-[420px]:block">
            <Sparkline data={trend} positive={(coin.price_change_percentage_7d_in_currency ?? 0) >= 0} />
          </span>

          <span className="text-right">
            <span className="block font-tabular text-sm font-medium text-[var(--color-text-primary)]">
              {formatPrice(coin.current_price)}
            </span>
            <Badge variant={changeVariant(change24h)} className="mt-1">{formatPercent(change24h)}</Badge>
          </span>
        </Link>

        <button
          type="button"
          aria-label={`${isWatchlisted ? "Remove" : "Add"} ${coin.name} ${isWatchlisted ? "from" : "to"} watchlist`}
          aria-pressed={isWatchlisted}
          onClick={() => onToggleWatchlist?.(coin)}
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full text-lg transition-colors hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] ${isWatchlisted ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}`}
        >
          {isWatchlisted ? "★" : "☆"}
        </button>
      </div>
    </li>
  );
}
