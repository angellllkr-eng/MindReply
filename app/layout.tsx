import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import Nav from "@/components/Nav";
import MRAgent from "@/components/MRAgent";
import MarketingPixels from "@/components/MarketingPixels";
import { normalizeLanguage, type LanguageSource } from "@/lib/language";
import { absoluteUrl, seoMarketKeywords, SITE_URL, targetMarkets } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MindReply | Executive Communication Intelligence",
    template: "%s | MindReply",
  },
  description:
    "AI communication intelligence for executives, psychologists, legal counsel, financial advisors, and high-trust professional teams.",
  alternates: { canonical: absoluteUrl("/") },
  keywords: [
    "AI communication intelligence",
    "executive communication",
    "professional email polisher",
    "behavioral intelligence",
    "legal communication AI",
    "psychologist communication tools",
    "financial advisor client communication",
    ...seoMarketKeywords,
  ],
  category: "AI communication intelligence",
  other: {
    "geo.region": targetMarkets.map((market) => market.code).join(","),
    "market:primary": targetMarkets.filter((market) => market.priority === "primary").map((market) => market.country).join(", "),
    "market:growth": targetMarkets.filter((market) => market.priority === "growth").map((market) => market.country).join(", "),
    "language:auto": "IP-country detected with browser fallback and manual override",
  },
  openGraph: {
    title: "MindReply | Executive Communication Intelligence",
    description:
      "Premium AI tools for sensitive professional messages, executive emails, specialist lexicons, and high-trust communication workflows.",
    url: absoluteUrl("/"),
    siteName: "MindReply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindReply | Executive Communication Intelligence",
    description: "Premium AI communication intelligence for high-trust professional work.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const initialLanguage = normalizeLanguage(requestHeaders.get("x-mr-language")) ?? "EN";
  const initialLanguageMode = requestHeaders.get("x-mr-language-mode") === "manual" ? "manual" : "auto";
  const initialLanguageSource = (requestHeaders.get("x-mr-language-source") ?? "fallback") as LanguageSource;
  const initialCountry = requestHeaders.get("x-mr-country");

  return (
    <html lang={initialLanguage.toLowerCase()} className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="antialiased bg-mr-cream-light text-gray-900" style={{ fontFamily: "var(--font-inter)" }}>
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLanguage} initialLanguageMode={initialLanguageMode} initialLanguageSource={initialLanguageSource} initialCountry={initialCountry}>
            <Nav />
            {children}
            <MRAgent />
            <MarketingPixels />
            <SpeedInsights />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
