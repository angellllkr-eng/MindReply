"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LANGS = ["EN", "FR", "DE", "ES", "BG", "IT", "PT"];
const LINKS = [
  { href: "/professionals", label: "Professionals" },
  { href: "/tools", label: "Tools" },
  { href: "/memberships", label: "Membership" },
  { href: "/lexicons", label: "Lexicons" },
  { href: "/analytics", label: "Intelligence" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("EN");

  return (
    <nav className="fixed w-full top-0 z-50 glass border-b border-[hsl(40_25%_88%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shadow-sm" style={{ background: "hsl(220 55% 20%)" }}>
              <span className="font-serif font-bold text-lg" style={{ color: "hsl(43 80% 60%)" }}>M</span>
            </div>
            <div>
              <span className="font-serif font-bold text-lg" style={{ color: "hsl(220 55% 20%)" }}>MindReply</span>
              <p className="text-[10px] leading-none mt-0.5" style={{ color: "hsl(220 25% 45%)" }}>Behavioral Intelligence</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={`nav-underline text-sm font-medium transition-colors pb-0.5 ${pathname === l.href ? "text-[hsl(220_55%_20%)]" : "text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)]"}`}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs font-medium bg-transparent border border-[hsl(40_25%_88%)] rounded px-2 py-1 cursor-pointer text-[hsl(220_25%_45%)]">
              {LANGS.map((l) => <option key={l}>{l}</option>)}
            </select>
            <Link href="/bookings" className="text-sm font-medium text-[hsl(220_25%_45%)] hover:text-[hsl(220_55%_20%)] transition-colors px-3 py-1.5">My Bookings</Link>
            <Link href="/professionals" className="text-sm font-medium px-4 py-2 rounded hover:opacity-90 transition-opacity shadow-sm" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
              Book a Session
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[hsl(40_25%_88%)] px-4 py-4 space-y-2 bg-white">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="block py-2 text-sm font-medium" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/professionals" className="block mt-3 text-sm font-medium text-center px-4 py-2.5 rounded" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }} onClick={() => setOpen(false)}>
            Book a Session
          </Link>
        </div>
      )}
    </nav>
  );
}
