import Card from "../ui/Card";
import { formatCompact, formatPrice } from "../../lib/formatters";

const usdCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const STAT_ITEMS = [
  {
    key: "market_cap",
    label: "Market cap",
    detail: "Total value of all coins",
    format: formatUsdCompact,
  },
  {
    key: "total_volume",
    label: "24h trading volume",
    detail: "Traded in the last 24 hours",
    format: formatUsdCompact,
  },
  {
    key: "market_cap_rank",
    label: "Market cap rank",
    detail: "By total market value",
    format: (value) => (value == null ? "—" : `#${value}`),
  },
  {
    key: "circulating_supply",
    label: "Circulating supply",
    detail: "Currently in circulation",
    format: formatCompact,
  },
  {
    key: "total_supply",
    label: "Total supply",
    detail: "Including locked tokens",
    format: formatCompact,
  },
  {
    key: "max_supply",
    label: "Max supply",
    detail: "Protocol-defined supply cap",
    format: formatCompact,
  },
  {
    key: "ath",
    label: "All-time high",
    detail: "Historical peak price",
    format: formatUsdPrice,
  },
  {
    key: "atl",
    label: "All-time low",
    detail: "Historical lowest price",
    format: formatUsdPrice,
  },
];

function formatUsdCompact(value) {
  const amount = typeof value === "number" ? value : value?.usd;
  return amount == null || !Number.isFinite(amount) ? "—" : usdCompactFormatter.format(amount);
}

function formatUsdPrice(value) {
  const amount = typeof value === "number" ? value : value?.usd;
  return formatPrice(amount);
}

export default function CoinStats({ coin }) {
  const marketData = coin?.market_data ?? {};

  return (
    <section aria-labelledby="coin-stats-heading" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2
          id="coin-stats-heading"
          className="text-lg font-semibold tracking-[var(--letter-spacing-heading)] text-[var(--color-text-primary)]"
        >
          Key statistics
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Supply, valuation and historical prices
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAT_ITEMS.map(({ key, label, detail, format }) => (
          <Card
            as="div"
            variant="compact"
            key={key}
            className="flex min-h-28 min-w-0 flex-col justify-between gap-4 p-4 sm:p-5"
          >
            <dt className="text-xs font-medium leading-5 text-[var(--color-text-secondary)] sm:text-sm">
              {label}
            </dt>
            <dd className="flex min-w-0 flex-col gap-1">
              <span className="break-words font-tabular text-sm font-semibold leading-6 tracking-tight text-[var(--color-text-primary)] sm:text-base">
                {format(marketData[key])}
              </span>
              <span className="text-xs leading-5 text-[var(--color-text-secondary)]">{detail}</span>
            </dd>
          </Card>
        ))}
      </dl>
    </section>
  );
}
