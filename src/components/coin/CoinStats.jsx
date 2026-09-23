const STAT_LABELS = [["ath", "All-time high"], ["atl", "All-time low"], ["circulating_supply", "Circulating supply"], ["market_cap_rank", "Market cap rank"]];

export default function CoinStats({ coin }) {
  const marketData = coin?.market_data ?? {};
  const formatValue = (key, value) => { if (value == null) return "-"; if (key === "market_cap_rank") return `#${value}`; if (key === "circulating_supply") return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value); return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value.usd ?? value); };
  return <section><h2 className="mb-3 text-base font-semibold text-[var(--color-text-primary)]">Key statistics</h2><dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{STAT_LABELS.map(([key, label]) => <div key={key} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><dt className="text-xs text-[var(--color-text-muted)]">{label}</dt><dd className="mt-2 font-tabular text-sm font-medium text-[var(--color-text-primary)]">{formatValue(key, marketData[key])}</dd></div>)}</dl></section>;
}