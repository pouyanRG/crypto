import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import "../styles/tokens.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Crypto Analytics Dashboard",
    template: "%s | Crypto Analytics Dashboard",
  },
  description:
    "Track live crypto market data, top movers, and your watchlist — powered by the CoinGecko API.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
