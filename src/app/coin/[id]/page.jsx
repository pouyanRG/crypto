import CoinDetailClient from "../../../components/coin/CoinDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const name = id
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: name || "Coin Detail",
    description: `Price, chart, all-time high/low, market cap rank, and description for ${name || "a single coin"}.`,
  };
}

export default async function CoinDetailPage({ params }) {
  const { id } = await params;
  return <CoinDetailClient id={id} />;
}
