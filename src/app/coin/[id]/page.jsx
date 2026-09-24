import Link from "next/link";
import Card from "../../../components/ui/Card";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const displayName = id
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
  const name = id
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: name || "Coin Detail",
    description: `Price, chart, all-time high/low, market cap rank, and description for ${name || "a single coin"}.`,
  };
}

export default async function CoinDetailPage({ params }) {
  const { id } = await params;

  return (
    <section className="space-y-5">
      <nav className="page-context" aria-label="Breadcrumb">
        <Link href="/">Dashboard</Link>
        <span aria-hidden="true">/</span>
        <Link href="/market">Markets</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{displayName || id}</span>
      </nav>
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4 font-tabular">
          {id}
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Dynamic route scaffolded. Full coin header, price chart with
          timeframe selector, and stats land in Phase 8.
        </p>
      </Card>
    </section>
  );
}
