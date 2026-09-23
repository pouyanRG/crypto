"use client";

import useCoinsMarket from "../lib/hooks/useCoinsMarket";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function Home() {
  const { data, isLoading, isError } = useCoinsMarket({ ids: ["bitcoin"], perPage: 1 });
  const bitcoin = data?.[0];
  const price = bitcoin?.current_price;
  const change = bitcoin?.price_change_percentage_24h;

  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 1 — Bootstrap
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Crypto Analytics Dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Live Bitcoin market data from CoinGecko, refreshed every minute.
        </p>
        <div className="flex items-center gap-4 font-tabular text-lg">
          {isLoading && <span className="text-[var(--color-text-muted)]">Loading Bitcoin...</span>}
          {isError && <span className="text-[var(--color-down)]">Bitcoin data unavailable</span>}
          {!isLoading && !isError && bitcoin && (
            <>
              <span className={change >= 0 ? "text-[var(--color-up)]" : "text-[var(--color-down)]"}>
                {change == null ? "-" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
              </span>
              <span className="text-[var(--color-text-primary)]">
                {price == null ? "-" : priceFormatter.format(price)}
              </span>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
