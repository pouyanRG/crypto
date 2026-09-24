import MarketRow from "./MarketRow";
import EmptyState from "../ui/EmptyState";
import { Table, TableBody, TableCell, TableEmpty, TableError, TableHead, TableLoading } from "../ui/Table";

const HEADERS = ["#", "Asset", "Price", "1h", "24h", "7d", "Volume", "Market cap", "Trend", ""];

export default function MarketTable({ coins = [], watchlistedIds = [], onToggleWatchlist, onSelect, emptyMessage = "No market data available", loading = false, error = undefined, onRetry }) {
  if (loading) return <Table ariaLabel="Market data" caption="Market data"><TableBody><TableLoading colSpan={HEADERS.length} /></TableBody></Table>;
  if (error) return <Table ariaLabel="Market data" caption="Market data"><TableBody><TableError colSpan={HEADERS.length} onRetry={onRetry}>{typeof error === "string" ? error : "Market data is temporarily unavailable"}</TableError></TableBody></Table>;
  if (coins.length === 0) return <EmptyState title={emptyMessage} description="Try adjusting your filters or search terms." />;

  return <Table caption="Market data" ariaLabel="Cryptocurrency market data" minWidth="980px"><TableHead>{HEADERS.map((header, index) => <TableCell key={`${header}-${index}`} header numeric={index !== 1 && index !== 8}>{header}</TableCell>)}</TableHead><TableBody>{coins.map((coin) => <MarketRow key={coin.id} coin={coin} isWatchlisted={watchlistedIds.includes(coin.id)} onToggleWatchlist={onToggleWatchlist} onSelect={onSelect} />)}</TableBody></Table>;
}