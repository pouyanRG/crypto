import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MobileTabBar from "../components/layout/MobileTabBar";
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
  openGraph: {
    title: "Crypto Analytics Dashboard",
    description: "Track live crypto market data, top movers, and your watchlist.",
    type: "website",
  },
};

export const viewport = {
  colorScheme: "dark light",
  themeColor: "#0b0e14",
  viewportFit: "cover",
};

const themeScript = `
  try {
    const stored = JSON.parse(localStorage.getItem("crypto-dashboard:app-state") || "null");
    const theme = stored?.state?.theme;
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
  } catch {}
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <div className="app-shell">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Header />
            <main id="main-content" className="app-content mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
              {children}
            </main>
            <Footer />
            <MobileTabBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
