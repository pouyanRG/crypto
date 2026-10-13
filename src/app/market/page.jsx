import { Suspense } from "react";
import MarketClient from "../../components/market/MarketClient";

export const metadata = {
  title: "Markets",
  description: "Live prices, 24h change, volume and market cap for tracked crypto assets.",
};

export default function MarketPage() {
  return (
    <Suspense fallback={null}>
      <MarketClient />
    </Suspense>
  );
}
