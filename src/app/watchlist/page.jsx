export const metadata = {
  title: "Watchlist",
  description: "Coins you've starred, read from localStorage.",
};

export default function WatchlistPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
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
      </div>
    </main>
  );
}
