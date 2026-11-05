"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useExchangeDetail from "../../lib/hooks/useExchangeDetail";
import useExchangeVolumeChart from "../../lib/hooks/useExchangeVolumeChart";
import { formatCompact } from "../../lib/formatters";
import { getCountryIso } from "../../lib/exchanges";
import Card from "../ui/Card";
import ErrorState from "../ui/ErrorState";
import Skeleton from "../ui/Skeleton";
import Tabs from "../ui/Tabs";
import CountryFlag from "./CountryFlag";
import DiscoverStatCard from "./DiscoverStatCard";
import ExchangeLogo from "./ExchangeLogo";
import TrustScoreBadge from "./TrustScoreBadge";

const RANGE_OPTIONS = [
  { value: 1, label: "24h" },
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
];

export default function ExchangeDetailClient({ id }) {
  const [range, setRange] = useState(7);
  const detailQuery = useExchangeDetail(id);
  const chartQuery = useExchangeVolumeChart(id, range);
  const detail = detailQuery.data;
  const points = chartQuery.data ?? [];

  const summaryMetrics = useMemo(() => {
    if (!detail) return [];
    return [
      { label: "24h volume", value: detail.trade_volume_24h_btc ? `${formatCompact(detail.trade_volume_24h_btc)} BTC` : "—" },
      { label: "Trust score", value: detail.trust_score == null ? "—" : `${detail.trust_score}/10` },
      { label: "Trust rank", value: detail.trust_score_rank == null ? "—" : `#${detail.trust_score_rank}` },
      { label: "Year established", value: detail.year_established ? String(detail.year_established) : "—" },
    ];
  }, [detail]);

  if (detailQuery.isError) {
    return <ErrorState title="Exchange details unavailable" description="We could not load this exchange right now." onRetry={detailQuery.refetch} />;
  }

  if (detailQuery.isLoading || !detail) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const countryName = detail.country || "—";
  const countryIso = getCountryIso(detail.country);

  return (
    <section className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-secondary)]">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard" className="hover:text-[var(--color-text-primary)]">Dashboard</Link>
          <span>›</span>
          <Link href="/discover" className="hover:text-[var(--color-text-primary)]">Discover</Link>
          <span>›</span>
          <span className="text-[var(--color-text-primary)]">{detail.name}</span>
        </div>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <ExchangeLogo src={detail.image} name={detail.name} size={56} />
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{detail.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              {countryName !== "—" ? (
                <>
                  {countryIso ? <span className="inline-flex items-center gap-2"><CountryFlag country={detail.country} showName /></span> : <span>{countryName}</span>}
                </>
              ) : (
                <span>Unknown country</span>
              )}
              <TrustScoreBadge score={detail.trust_score ?? null} />
              {detail.year_established ? <span>Est. {detail.year_established}</span> : null}
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((item) => (
          <DiscoverStatCard key={item.label} icon="barChart" value={item.value} label={item.label} loading={detailQuery.isLoading} />
        ))}
      </div>

      <Card as="div" variant="default" className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Volume history</h2>
          <Tabs
            id="exchange-range"
            appearance="polished"
            active={String(range)}
            onChange={(value) => setRange(Number(value))}
            tabs={RANGE_OPTIONS.map((option) => ({ value: String(option.value), label: option.label }))}
          />
        </div>

        {chartQuery.isError || points.length < 2 ? (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No volume history available</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points.map((point) => ({ timestamp: point.timestamp, value: point.value }))} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <defs>
                  <linearGradient id="volume-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" hide />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip
                  formatter={(value) => [`${formatCompact(Number(value))} BTC`, "Volume"]}
                  labelFormatter={(value) => new Date(Number(value)).toLocaleString()}
                  contentStyle={{ backgroundColor: "var(--color-chart-tooltip)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-text-primary)" }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--color-accent)" fill="url(#volume-fill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card as="div" variant="default" className="p-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">About</h2>
        {detail.description ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--color-text-secondary)]">{detail.description}</p>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No description available for this exchange.</p>
        )}
        {detail.url ? (
          <a href={detail.url} target="_blank" rel="noreferrer noopener" className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]">
            Visit website
          </a>
        ) : null}
      </Card>
    </section>
  );
}
