import MarketRow from "./MarketRow";

const HEADERS = ["#", "Asset", "Price", "1h", "24h", "7d", "Volume", "Market cap", "Trend", ""];

export default function MarketTable({ coins = [], watchlistedIds = [], onToggleWatchlist, onSelect, emptyMessage = "No market data available" }) {
  if (coins.length === 0) return <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center text-sm text-[var(--color-text-muted)]">{emptyMessage}</div>;

  return <div className="w-full overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)]"><table className="w-full min-w-[980px] border-collapse text-sm"><thead className="bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"><tr>{HEADERS.map((header) => <th key={header} className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide first:text-right">{header}</th>)}</tr></thead><tbody>{coins.map((coin) => <MarketRow key={coin.id} coin={coin} isWatchlisted={watchlistedIds.includes(coin.id)} onToggleWatchlist={onToggleWatchlist} onSelect={onSelect} />)}</tbody></table></div>;
}