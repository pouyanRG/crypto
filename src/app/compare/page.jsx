import Card from "../../components/ui/Card";

export const metadata = {
  title: "Compare",
  description:
    "Compare 2-3 coins side by side with a normalized overlaid price chart.",
};

export default function ComparePage() {
  return (
    <section className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Compare
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Coin selection, the normalized overlay chart, and the comparison
          table are planned for a later product phase.
        </p>
      </Card>
    </section>
  );
}
