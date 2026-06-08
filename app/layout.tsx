import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mind-reply.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MindReply | Executive Nervous System",
    template: "%s | MindReply",
  },
  description: "A private decision layer for modern work. Paste the pressure. Receive one synthesis and one recommended action.",
  alternates: { canonical: "/" },
  keywords: [
    "Executive Nervous System",
    "Decision Infrastructure",
    "decision layer",
    "private decision filter",
    "professional playbooks",
    "risk check",
    "calm execution",
  ],
  category: "Decision Infrastructure",
  openGraph: {
    title: "MindReply | Executive Nervous System",
    description: "A private decision layer that turns pressure into one clear next move.",
    url: "/",
    siteName: "MindReply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindReply | Executive Nervous System",
    description: "Paste the pressure. Receive one synthesis and one recommended action.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="antialiased bg-[#081121] text-[#f8f5f0]" style={{ fontFamily: "var(--font-inter)" }}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
