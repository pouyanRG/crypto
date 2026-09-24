export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-[var(--color-text-muted)] sm:flex-row sm:px-6">
        <p>Market intelligence for disciplined operators.</p>
        <a
          href="https://www.coingecko.com/en/api"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
        >
          CoinGecko API
        </a>
      </div>
    </footer>
  );
}