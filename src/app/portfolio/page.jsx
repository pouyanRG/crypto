import PortfolioClient from "../../components/portfolio/PortfolioClient";

export const metadata = {
  title: "Portfolio",
  description: "Track portfolio assets stored locally in your browser.",
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
