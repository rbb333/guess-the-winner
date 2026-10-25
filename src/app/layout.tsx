import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/libre-caslon-text/400.css";
import "@fontsource/libre-caslon-text/700.css";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieProvider } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "Guess the Winner – FIFA World Cup analysis & predictions",
  description:
    "Browse FIFA World Cup schedules, results and standings (1986–2022) and get a statistical match prediction. Educational project.",
};

export const viewport: Viewport = { themeColor: "#0a1224" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CookieProvider>
          <Header />
          {children}
          <Footer />
        </CookieProvider>
      </body>
    </html>
  );
}
