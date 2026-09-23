export const metadata = {
  title: "Markets",
  description:
    "Full cryptocurrency market table with price, 1h/24h/7d change, volume, and market cap.",
};

export default function MarketPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 2 — Folder structure
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Markets
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Route scaffolded. The full market table, tabs, search, and
          watchlist star button land in Phase 7.
        </p>
      </div>
    </main>
  );
}
