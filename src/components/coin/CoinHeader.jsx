import Image from "next/image";
import clsx from "clsx";
import Button from "../ui/Button";

function WatchlistIcon({ active }) {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

function TrendIcon({ positive }) {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {positive ? (
        <path d="m2 11 4-4 2.5 2.5L14 4M9 4h5v5" />
      ) : (
        <path d="m2 5 4 4 2.5-2.5L14 12M9 12h5V7" />
      )}
    </svg>
  );
}

export default function CoinHeader({ coin, isWatchlisted = false, onToggleWatchlist }) {
  const change = coin?.market_data?.price_change_percentage_24h;
  const price = coin?.market_data?.current_price?.usd;
  const coinImage = coin?.image?.large ?? coin?.image?.small ?? coin?.image?.thumb;
  const changeLabel = change == null ? "" : `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  const changeColor =
    change > 0
      ? "text-[var(--color-up-text)]"
      : change < 0
        ? "text-[var(--color-down)]"
        : "text-[var(--color-text-secondary)]";

  return (
    <header className="flex flex-col gap-5 border-b border-[var(--color-border-subtle)] pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {coinImage ? (
          <Image
            src={coinImage}
            alt=""
            width={56}
            height={56}
            sizes="56px"
            className="size-14 shrink-0 rounded-full bg-[var(--color-surface)] object-cover ring-1 ring-[var(--color-border-subtle)]"
          />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-sm font-semibold uppercase tracking-wide text-[var(--color-accent-text)] ring-1 ring-[var(--color-border-subtle)]">
            {coin?.symbol?.slice(0, 3) ?? "?"}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="truncate text-2xl font-semibold tracking-[var(--letter-spacing-heading)] text-[var(--color-text-primary)]">
              {coin?.name ?? "Coin"}
            </h1>
            {coin?.symbol && (
              <span className="rounded-[var(--radius-sm)] bg-[var(--color-surface)] px-2 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                {coin.symbol}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="font-tabular text-xl font-medium leading-tight text-[var(--color-text-primary)] sm:text-2xl">
              {price == null
                ? "—"
                : new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: price < 1 ? 6 : 2,
                  }).format(price)}
            </p>
            {changeLabel && (
              <span
                className={clsx(
                  "inline-flex min-h-7 items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-2.5 py-1 text-xs font-semibold font-tabular",
                  changeColor,
                )}
                title="24-hour price change"
              >
                {change !== 0 && <TrendIcon positive={change > 0} />}
                {changeLabel}
                <span className="font-medium text-[var(--color-text-muted)]">24h</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        variant={isWatchlisted ? "outline" : "secondary"}
        size="lg"
        onClick={() => onToggleWatchlist?.(coin)}
        aria-label={`${isWatchlisted ? "Remove" : "Add"} ${coin?.name ?? "coin"} ${isWatchlisted ? "from" : "to"} watchlist`}
        aria-pressed={isWatchlisted}
        className={clsx(
          "min-h-11 w-full rounded-[var(--radius-lg)] px-5 transition-[background-color,border-color,color,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] sm:w-auto",
          isWatchlisted &&
            "border-[var(--color-accent)]/30 bg-[var(--color-accent-muted)] text-[var(--color-accent-text)] hover:bg-[var(--color-accent-muted)]",
        )}
      >
        <WatchlistIcon active={isWatchlisted} />
        {isWatchlisted ? "In watchlist" : "Add to watchlist"}
      </Button>
    </header>
  );
}
