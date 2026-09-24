import Card from "../../../components/ui/Card";

export async function generateMetadata({ params }) {
  const { id } = await params;
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
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 2 — Folder structure
        </p>
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
