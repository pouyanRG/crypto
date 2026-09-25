import WatchlistClient from "../../components/watchlist/WatchlistClient";

export const metadata = {
  title: "Watchlist",
  description: "Coins you've starred, read from localStorage.",
};

export default function WatchlistPage() {
  return <WatchlistClient />;
}
