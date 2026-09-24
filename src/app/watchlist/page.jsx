import Card from "../../components/ui/Card";

export const metadata = {
  title: "Watchlist",
  description: "Coins you've starred, read from localStorage.",
};

export default function WatchlistPage() {
  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Watchlist
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Reading starred coins from localStorage and the empty state are
          planned for a later product phase.
        </p>
      </Card>
    </section>
  );
}
