import Card from "../../../components/ui/Card";

export const metadata = {
  title: "Coin Detail",
  description:
    "Price, chart, all-time high/low, market cap rank, and description for a single coin.",
};

export default async function CoinDetailPage({ params }) {
  const { id } = await params;

  return (
    <main className="flex-1 flex items-center justify-center p-8">
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
    </main>
  );
}
