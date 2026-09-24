import Card from "../../components/ui/Card";

export const metadata = {
  title: "Markets",
  description:
    "Full cryptocurrency market table with price, 1h/24h/7d change, volume, and market cap.",
};

export default function MarketPage() {
  return (
    <section className="space-y-5">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
          Markets
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          The market workspace is being built on the shared shell. Use the
          dashboard for the current tracked-market snapshot.
        </p>
      </Card>
    </section>
  );
}
