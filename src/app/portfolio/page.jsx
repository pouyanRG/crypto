import Card from "../../components/ui/Card";

export const metadata = {
  title: "Portfolio",
  description: "Track portfolio assets stored locally in your browser.",
};

export default function PortfolioPage() {
  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <p className="mb-2 text-sm text-[var(--color-text-secondary)]">Phase 4 - Shared Layout</p>
        <h1 className="mb-4 text-2xl font-semibold text-[var(--color-text-primary)]">Portfolio</h1>
        <p className="text-[var(--color-text-secondary)]">Portfolio tracking will be added in a later phase.</p>
      </Card>
    </section>
  );
}