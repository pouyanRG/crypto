import Link from "next/link";
import { computeVolumeChange } from "../../lib/exchanges";
import { formatCompact } from "../../lib/formatters";
import NavIcon from "../layout/NavIcon";
import Sparkline from "../market/Sparkline";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/Table";
import Skeleton from "../ui/Skeleton";
import ChangeCell from "./ChangeCell";
import CountryFlag from "./CountryFlag";
import ExchangeLogo from "./ExchangeLogo";
import TrustScoreBadge from "./TrustScoreBadge";

export default function ExchangeTable({ exchanges = [], startIndex = 0, volumeCharts = { byId: {} } }) {
  return (
    <Table minWidth="960px" ariaLabel="Exchange rankings" caption="Exchange rankings by reported 24-hour trading volume">
      <TableHead>
        <TableCell header>#</TableCell>
        <TableCell header>Exchange</TableCell>
        <TableCell header>Country</TableCell>
        <TableCell header>Trust score</TableCell>
        <TableCell header numeric>24h volume</TableCell>
        <TableCell header numeric>24h change</TableCell>
        <TableCell header>Trend</TableCell>
        <TableCell header>Action</TableCell>
      </TableHead>
      <TableBody>
        {exchanges.map((exchange, index) => {
          const chart = volumeCharts.byId?.[exchange.id];
          const points = chart?.points ?? [];
          const change = computeVolumeChange(points);
          const loading = chart?.isLoading;
          const hasError = chart?.isError;

          return (
            <TableRow key={exchange.id} className="align-middle">
              <TableCell className="font-tabular text-[var(--color-text-muted)]">{startIndex + index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <ExchangeLogo src={exchange.image} name={exchange.name} size={30} />
                  <span className="font-medium text-[var(--color-text-primary)]">{exchange.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <CountryFlag country={exchange.country} showName />
              </TableCell>
              <TableCell>
                <TrustScoreBadge score={exchange.trust_score ?? null} />
              </TableCell>
              <TableCell numeric className="font-tabular text-[var(--color-text-primary)]">
                {formatCompact(exchange.trade_volume_24h_btc)} BTC
              </TableCell>
              <TableCell numeric>
                {loading ? <Skeleton className="ml-auto h-4 w-14" /> : <ChangeCell value={hasError ? null : change} />}
              </TableCell>
              <TableCell>
                {loading ? (
                  <Skeleton className="h-8 w-28" />
                ) : hasError ? (
                  <span className="text-sm text-[var(--color-text-muted)]">—</span>
                ) : (
                  <Sparkline data={points.map((point) => ({ value: point.value }))} positive={Number(change ?? 0) >= 0} className="h-8 w-28" />
                )}
              </TableCell>
              <TableCell>
                <Link href={`/discover/exchange/${encodeURIComponent(exchange.id)}`} aria-label={`View details for ${exchange.name}`} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
                  <span>View details</span>
                  <NavIcon name="arrowRight" className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
