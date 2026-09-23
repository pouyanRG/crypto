export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 1 — Bootstrap
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Crypto Analytics Dashboard
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Next.js + Tailwind + SWR + Recharts are installed and the design
          tokens are wired up. Dashboard content lands in Phase 6.
        </p>
        <div className="flex items-center gap-4 font-tabular text-lg">
          <span className="text-[var(--color-up)]">+2.34%</span>
          <span className="text-[var(--color-down)]">-1.08%</span>
          <span className="text-[var(--color-text-primary)]">$67,240.15</span>
        </div>
      </div>
    </main>
  );
}
