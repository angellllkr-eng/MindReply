"use client";

import { useState } from "react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANG_OPTIONS, type LanguageCode, useLanguage } from "@/components/LanguageProvider";

const LINKS = [
  { href: "/professionals", labelKey: "professionals" },
  { href: "/tools", labelKey: "tools" },
  { href: "/memberships", labelKey: "membership" },
  { href: "/lexicons", labelKey: "lexicons" },
  { href: "/integrations", labelKey: "integrations" },
  { href: "/analytics", labelKey: "intelligence" },
] as const;

const AUTH_LINKS = [
  { href: "/bookings", labelKey: "myBookings" },
  { href: "/login", labelKey: "memberLogin" },
  { href: "/sign-up", labelKey: "createAccount" },
] as const;

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(248,245,240,0.18)] bg-[rgba(13,28,54,0.88)] shadow-[0_12px_40px_rgba(8,18,35,0.22)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(13,28,54,0.78)]">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-3 md:h-[68px]">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="MindReply home">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm" style={{ background: "hsl(220 45% 13%)" }}>
              <span className="font-serif text-lg font-bold" style={{ color: "hsl(43 80% 60%)" }}>M</span>
            </div>
            <div className="min-w-0">
              <span className="block truncate font-serif text-base font-bold leading-tight text-[hsl(43_70%_88%)] sm:text-lg">MindReply</span>
              <p className="hidden truncate text-[10px] leading-none text-[rgba(248,245,240,0.55)] sm:block">{t("behavioralIntelligence")}</p>
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-2.5 py-2 text-sm font-medium transition-colors lg:px-3 ${
                  pathname === link.href ? "bg-white/10 text-[hsl(43_80%_60%)]" : "text-[rgba(248,245,240,0.68)] hover:bg-white/5 hover:text-[hsl(43_70%_88%)]"
                } ${link.href === "/analytics" ? "hidden xl:inline-flex" : ""}`}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <label className="relative hidden lg:block">
              <span className="sr-only">{t("language")}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                className="h-9 appearance-none rounded-lg border border-white/20 bg-transparent pl-3 pr-8 text-xs font-semibold text-[rgba(248,245,240,0.7)] outline-none transition focus:border-[hsl(43_80%_60%)]"
              >
                {LANG_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.code}</option>)}
              </select>
              <ChevronDown aria-hidden="true" size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgba(248,245,240,0.55)]" />
            </label>
            {clerkEnabled ? (
              <>
                <Show when="signed-in">
                  <Link href="/bookings" prefetch={false} className="hidden rounded-md px-3 py-2 text-sm font-medium text-[rgba(248,245,240,0.68)] transition-colors hover:bg-white/5 hover:text-[hsl(43_70%_88%)] lg:inline-flex">{t("myBookings")}</Link>
                  <UserButton />
                </Show>
                <Show when="signed-out">
                  <SignInButton mode="redirect">
                    <button type="button" className="hidden rounded-md px-3 py-2 text-sm font-medium text-[rgba(248,245,240,0.68)] transition-colors hover:bg-white/5 hover:text-[hsl(43_70%_88%)] lg:inline-flex">{t("memberLogin")}</button>
                  </SignInButton>
                  <SignUpButton mode="redirect">
                    <button type="button" className="hidden rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 xl:inline-flex" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>{t("createAccount")}</button>
                  </SignUpButton>
                </Show>
              </>
            ) : (
              <>
                <Link href="/bookings" className="hidden rounded-md px-3 py-2 text-sm font-medium text-[rgba(248,245,240,0.68)] transition-colors hover:bg-white/5 hover:text-[hsl(43_70%_88%)] lg:inline-flex">{t("myBookings")}</Link>
                <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm font-medium text-[rgba(248,245,240,0.68)] transition-colors hover:bg-white/5 hover:text-[hsl(43_70%_88%)] lg:inline-flex">{t("memberLogin")}</Link>
              </>
            )}

            <Link href="/professionals" className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 lg:px-4" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              {t("bookSession")}
            </Link>
          </div>

          <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-[hsl(43_70%_88%)] md:hidden" onClick={() => setOpen(!open)} aria-label={open ? t("closeMenu") : t("openMenu")} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/15 bg-[hsl(220_55%_20%)] px-4 py-4 shadow-2xl md:hidden">
          <div className="grid gap-1">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-sm font-medium text-[rgba(248,245,240,0.78)] hover:bg-white/5" onClick={() => setOpen(false)}>{t(link.labelKey)}</Link>
            ))}
            {AUTH_LINKS.map((link) => (
              <Link key={link.href} href={link.href} prefetch={link.href === "/bookings" ? false : undefined} className="rounded-lg px-3 py-3 text-sm font-medium text-[rgba(248,245,240,0.78)] hover:bg-white/5" onClick={() => setOpen(false)}>{t(link.labelKey)}</Link>
            ))}
            <label className="mt-2 rounded-lg border border-white/10 px-3 py-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[rgba(248,245,240,0.45)]">
                {t("language")}
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as LanguageCode)}
                className="w-full rounded-md border border-white/15 bg-[hsl(220_45%_16%)] px-3 py-2 text-sm font-semibold text-[hsl(43_70%_88%)] outline-none"
              >
                {LANG_OPTIONS.map((option) => <option key={option.code} value={option.code}>{option.code} - {option.name}</option>)}
              </select>
            </label>
          </div>
          <Link href="/professionals" className="mt-4 block rounded-lg px-4 py-3 text-center text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }} onClick={() => setOpen(false)}>
            {t("bookSession")}
          </Link>
        </div>
      )}
    </nav>
  );
}
