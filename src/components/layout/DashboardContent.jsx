"use client";

import useCoinsMarket from "../../lib/hooks/useCoinsMarket";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export default function DashboardContent() {
  const { data, isLoading, isError } = useCoinsMarket({ ids: ["bitcoin"], perPage: 1 });
  const bitcoin = data?.[0];
  const price = bitcoin?.current_price;
  const change = bitcoin?.price_change_percentage_24h;

  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <p className="mb-2 text-sm text-[var(--color-text-secondary)]">Phase 1 — Bootstrap</p>
        <h1 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)]">Crypto Analytics Dashboard</h1>
        <p className="mb-6 text-[var(--color-text-secondary)]">Live Bitcoin market data from CoinGecko, refreshed every minute.</p>
        <div className="flex items-center gap-4 font-tabular text-lg">
          {isLoading && <Skeleton variant="text" className="max-w-40" />}
          {isError && <ErrorState title="Bitcoin data unavailable" description="We could not refresh the latest Bitcoin price." />}
          {!isLoading && !isError && bitcoin && (
            <>
              <span className={change >= 0 ? "text-[var(--color-up)]" : "text-[var(--color-down)]"}>
                {change == null ? "-" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
              </span>
              <span className="text-[var(--color-text-primary)]">{price == null ? "-" : priceFormatter.format(price)}</span>
            </>
          )}
        </div>
      </Card>
    </section>
  );
}