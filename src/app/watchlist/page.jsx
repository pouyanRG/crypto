import Card from "../../components/ui/Card";

export const metadata = {
  title: "Watchlist",
  description: "Coins you've starred, read from localStorage.",
};

export default function WatchlistPage() {
  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 2 — Folder structure
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Watchlist
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Route scaffolded. Reading starred coins from localStorage and the
          empty state land in Phase 9.
        </p>
      </Card>
    </section>
  );
}
