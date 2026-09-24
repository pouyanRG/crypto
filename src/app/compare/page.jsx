import Card from "../../components/ui/Card";

export const metadata = {
  title: "Compare",
  description:
    "Compare 2-3 coins side by side with a normalized overlaid price chart.",
};

export default function ComparePage() {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          Phase 2 — Folder structure
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Compare
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Route scaffolded. Coin selection, the normalized overlay chart,
          and the comparison table land in Phase 10.
        </p>
      </Card>
    </main>
  );
}
