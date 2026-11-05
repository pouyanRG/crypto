import Link from "next/link";
import { computeVolumeChange } from "../../lib/exchanges";
import { formatCompact } from "../../lib/formatters";
import NavIcon from "../layout/NavIcon";
import Sparkline from "../market/Sparkline";
import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";
import ChangeCell from "./ChangeCell";
import CountryFlag from "./CountryFlag";
import ExchangeLogo from "./ExchangeLogo";
import TrustScoreBadge from "./TrustScoreBadge";

export default function ExchangeCard({ exchange, chart }) {
  const change = chart ? computeVolumeChange(chart.points ?? []) : null;
  const loading = chart?.isLoading;
  const hasError = chart?.isError;

  return (
    <li className="py-4">
      <Card as="div" variant="default" className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ExchangeLogo src={exchange.image} name={exchange.name} size={32} />
            <div className="min-w-0">
              <div className="truncate font-medium text-[var(--color-text-primary)]">{exchange.name}</div>
            </div>
          </div>
          <TrustScoreBadge score={exchange.trust_score ?? null} />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <CountryFlag country={exchange.country} showName />
          <div className="font-tabular text-[var(--color-text-primary)]">{formatCompact(exchange.trade_volume_24h_btc)} BTC</div>
        </div>

        <div className="grid grid-cols-2 items-center gap-3">
          <div className="text-sm text-[var(--color-text-secondary)]">24h change</div>
          <div className="flex justify-end">
            {loading ? <Skeleton className="h-4 w-14" /> : <ChangeCell value={hasError ? null : change} />}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">Trend</div>
          {loading ? (
            <Skeleton className="h-8 w-full" />
          ) : hasError ? (
            <span className="text-sm text-[var(--color-text-muted)]">—</span>
          ) : (
            <Sparkline data={(chart?.points ?? []).map((point) => ({ value: point.value }))} positive={Number(change ?? 0) >= 0} className="h-8 w-full" />
          )}
        </div>

        <Link href={`/discover/exchange/${encodeURIComponent(exchange.id)}`} className="inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-200 hover:bg-[var(--color-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
          <span>View details</span>
          <NavIcon name="arrowRight" className="size-4" />
        </Link>
      </Card>
    </li>
  );
}
