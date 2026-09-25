import MarketRow from "./MarketRow";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableCell, TableEmpty, TableError, TableHead, TableLoading } from "../ui/Table";

const HEADERS = [
  { label: "#", key: "rank" },
  { label: "Asset" },
  { label: "Price", key: "price" },
  { label: "1h", key: "change_1h" },
  { label: "24h", key: "change_24h" },
  { label: "7d", key: "change_7d" },
  { label: "Volume", key: "volume" },
  { label: "Market cap", key: "market_cap" },
  { label: "Trend" },
  { label: "" },
];

export default function MarketTable({ coins = [], watchlistedIds = [], onToggleWatchlist, onSelect, sort, onSort, emptyMessage = "No market data available", loading = false, error = undefined, onRetry }) {
  if (loading) return <Table ariaLabel="Market data" caption="Market data"><TableBody><TableLoading colSpan={HEADERS.length} /></TableBody></Table>;
  if (error) return <Table ariaLabel="Market data" caption="Market data"><TableBody><TableError colSpan={HEADERS.length} onRetry={onRetry}>{typeof error === "string" ? error : "Market data is temporarily unavailable"}</TableError></TableBody></Table>;
  if (coins.length === 0) return <EmptyState title={emptyMessage} description="Try adjusting your filters or search terms." />;

  return <Table caption="Market data" ariaLabel="Cryptocurrency market data" minWidth="980px"><TableHead>{HEADERS.map(({ label, key }, index) => <TableCell key={`${label}-${index}`} header numeric={index !== 1 && index !== 8} ariaSort={sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}>{key ? <button type="button" onClick={() => onSort?.(key)} className="inline-flex items-center gap-1 hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]">{label}<span aria-hidden="true">{sort?.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span></button> : label}</TableCell>)}</TableHead><TableBody>{coins.map((coin) => <MarketRow key={coin.id} coin={coin} isWatchlisted={watchlistedIds.includes(coin.id)} onToggleWatchlist={onToggleWatchlist} onSelect={onSelect} />)}</TableBody></Table>;
}