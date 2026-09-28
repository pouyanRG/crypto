import MarketRow from "./MarketRow";
import MarketRowCard from "./MarketRowCard";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import { Table, TableBody, TableCell, TableHead } from "../ui/Table";

const HEADERS = [
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

export default function MarketTable({
  coins = [],
  watchlistedIds = [],
  onToggleWatchlist,
  onSelect,
  sort,
  onSort,
  emptyMessage = "No market data available",
  loading = false,
  error = undefined,
  onRetry,
}) {
  if (loading) {
    return (
      <>
        <div className="space-y-3 p-4 md:hidden">
          <Skeleton variant="row" className="h-14" />
          <Skeleton variant="row" className="h-14" />
          <Skeleton variant="row" className="h-14" />
        </div>
        <div className="hidden md:block">
          <Table ariaLabel="Market data" caption="Market data">
            <TableBody>
              <tr aria-busy="true">
                <td colSpan={HEADERS.length} className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                  Loading
                </td>
              </tr>
            </TableBody>
          </Table>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Market data unavailable"
        description={typeof error === "string" ? error : "Market data is temporarily unavailable"}
        onRetry={onRetry}
      />
    );
  }

  if (coins.length === 0) {
    return <EmptyState title={emptyMessage} description="Try adjusting your filters or search terms." />;
  }

  return (
    <>
      <ul className="divide-y divide-[var(--color-border-subtle)] px-4 md:hidden" aria-label="Cryptocurrency market data">
        {coins.map((coin) => (
          <MarketRowCard
            key={coin.id}
            coin={coin}
            isWatchlisted={watchlistedIds.includes(coin.id)}
            onToggleWatchlist={onToggleWatchlist}
            onSelect={onSelect}
          />
        ))}
      </ul>

      <div className="hidden md:block">
        <Table caption="Market data" ariaLabel="Cryptocurrency market data" minWidth="900px">
          <TableHead>
            {HEADERS.map(({ label, key }, index) => {
              const isFirst = index === 0;
              const isLast = index === HEADERS.length - 1;
              return (
                <TableCell
                  key={`${label}-${index}`}
                  header
                  numeric={index !== 0 && index !== 7}
                  ariaSort={sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  className={
                    isFirst || isLast
                      ? `sticky z-20 bg-[var(--color-bg-elevated)] ${
                          isFirst ? "left-0 border-r" : "right-0 border-l"
                        } border-[var(--color-border-subtle)]`
                      : undefined
                  }
                >
                  {key ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(key)}
                      className="inline-flex items-center gap-1 hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      {label}
                      <span aria-hidden="true">{sort?.key === key ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}</span>
                    </button>
                  ) : (
                    label
                  )}
                </TableCell>
              );
            })}
          </TableHead>
          <TableBody>
            {coins.map((coin) => (
              <MarketRow
                key={coin.id}
                coin={coin}
                isWatchlisted={watchlistedIds.includes(coin.id)}
                onToggleWatchlist={onToggleWatchlist}
                onSelect={onSelect}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}