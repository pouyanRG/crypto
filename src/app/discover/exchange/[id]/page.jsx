import ExchangeDetailClient from "../../../../components/discover/ExchangeDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const name = id
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");

  return {
    title: name || "Exchange Details",
    description: `Trading volume, trust score, and exchange information for ${name || "this exchange"}.`,
  };
}

export default async function ExchangeDetailPage({ params }) {
  const { id } = await params;
  return <ExchangeDetailClient id={id} />;
}