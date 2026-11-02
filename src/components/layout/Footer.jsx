export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-4 py-4 text-center text-xs text-[var(--color-text-muted)] sm:flex-row sm:px-6">
        <p>Market intelligence for disciplined operators.</p>
      </div>
    </footer>
  );
}