import type { Metadata } from "next";
import "../styles/globals.css";
import Nav from "@/components/Nav";
import MRAgent from "@/components/MRAgent";

export const metadata: Metadata = {
  title: "MindReply — Behavioral Communication Intelligence",
  description: "The N1 worldwide ecosystem connecting professionals with elite advisors and AI-powered communication tools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <MRAgent />
      </body>
    </html>
  );
}
