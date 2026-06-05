"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Gift, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type SessionState = {
  configured: boolean;
  confirmed: boolean;
  status: string;
  paymentStatus: string;
  tier: string;
  customerEmail?: string | null;
};

type StoredMembership = {
  tier: string;
  confirmed: boolean;
  activatedAt: string;
};

const tierLabels: Record<string, string> = {
  curator: "Curator",
  strategist: "Strategist",
  sovereign: "Sovereign",
};

const productAccess = [
  { href: "/tools/email-polisher", title: "Email Polisher", body: "Send high-trust messages with calmer executive language." },
  { href: "/tools/text-refiner", title: "Text Refiner", body: "Shape notes into composed, intentional communication." },
  { href: "/lexicons", title: "Specialist Lexicons", body: "Use clinical, legal, finance, and executive language patterns." },
  { href: "/dashboard/analytics", title: "Behavioral Analytics", body: "Track clarity, trust, tone, and response energy." },
];

function normalizeTier(value: string | null) {
  const tier = String(value ?? "").toLowerCase();
  return tierLabels[tier] ? tier : "strategist";
}

export default function PurchaseSuccessPanel() {
  const params = useSearchParams();
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");
  const requestedTier = normalizeTier(params.get("tier"));
  const [session, setSession] = useState<SessionState | null>(null);
  const [storedMembership, setStoredMembership] = useState<StoredMembership | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("mindreply.membership");
    if (saved) {
      try {
        setStoredMembership(JSON.parse(saved) as StoredMembership);
      } catch {
        window.localStorage.removeItem("mindreply.membership");
      }
    }
  }, []);

  useEffect(() => {
    if (checkout !== "success") return;

    const controller = new AbortController();
    const search = new URLSearchParams({ tier: requestedTier });
    if (sessionId) search.set("session_id", sessionId);

    setSession({
      configured: true,
      confirmed: false,
      status: "checking",
      paymentStatus: "checking",
      tier: requestedTier,
    });

    fetch(`/api/checkout/session?${search.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: SessionState) => {
        setSession(data);
        if (data.confirmed) {
          const membership = {
            tier: data.tier,
            confirmed: true,
            activatedAt: new Date().toISOString(),
          };
          window.localStorage.setItem("mindreply.membership", JSON.stringify(membership));
          setStoredMembership(membership);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSession({
            configured: true,
            confirmed: false,
            status: "lookup_failed",
            paymentStatus: "unknown",
            tier: requestedTier,
          });
        }
      });

    return () => controller.abort();
  }, [checkout, requestedTier, sessionId]);

  const activeMembership = useMemo(() => {
    if (session?.confirmed) return { tier: session.tier, confirmed: true };
    if (storedMembership?.confirmed) return storedMembership;
    return null;
  }, [session, storedMembership]);

  const referralLink = "https://www.mind-reply.com/?ref=member-signal";
  const activeTier = tierLabels[activeMembership?.tier ?? requestedTier] ?? "Strategist";
  const isCheckoutReturn = checkout === "success";

  if (!isCheckoutReturn && !activeMembership) return null;

  const copyReferral = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border bg-[hsl(220_45%_13%)] text-[hsl(40_33%_97%)] shadow-[0_22px_70px_rgba(8,18,35,0.18)]" style={{ borderColor: "rgba(248,245,240,0.14)" }}>
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(248,245,240,0.18)] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[hsl(43_80%_60%)]">
            <CheckCircle2 size={15} />
            {activeMembership ? "Access activated" : "Payment check in progress"}
          </div>
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">
            {activeMembership ? `${activeTier} membership confirmed` : "Confirming your membership"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(248,245,240,0.72)]">
            {activeMembership
              ? "Your product path is ready now: refine the message, choose the right behavioral frame, and turn the next conversation into a trust signal."
              : "Stripe verification is running. Once the checkout session is confirmed, your product access activates in this dashboard."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {productAccess.map((item) => (
              <Link key={item.href} href={activeMembership ? item.href : "/memberships"} className={`rounded-xl border border-[rgba(248,245,240,0.12)] bg-white/[0.04] p-4 transition hover:border-[hsl(43_80%_60%)] hover:bg-white/[0.07] ${activeMembership ? "" : "opacity-70"}`}>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[hsl(43_70%_88%)]">
                  <Wand2 size={15} />
                  {item.title}
                </div>
                <p className="text-xs leading-5 text-[rgba(248,245,240,0.58)]">{item.body}</p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="border-t border-[rgba(248,245,240,0.12)] bg-[rgba(255,255,255,0.04)] p-6 sm:p-7 lg:border-l lg:border-t-0">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(43_80%_60%)] text-[hsl(220_45%_13%)]">
            <Gift size={20} />
          </div>
          <h3 className="font-serif text-xl font-bold">{activeMembership ? "Bring the next high-trust mind in" : "Verification checkpoint"}</h3>
          <p className="mt-2 text-sm leading-6 text-[rgba(248,245,240,0.68)]">
            {activeMembership
              ? "People copy calm authority. Share MindReply with one colleague who handles sensitive decisions and let the network compound."
              : "If this state stays visible, confirm the Stripe session in the dashboard or return to memberships to restart checkout."}
          </p>
          {activeMembership ? (
            <>
              <button
                type="button"
                onClick={copyReferral}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}
              >
                {copied ? <Sparkles size={17} /> : <Copy size={17} />}
                {copied ? "Referral link copied" : "Copy referral signal"}
              </button>
              <p className="mt-3 break-all text-[11px] text-[rgba(248,245,240,0.42)]">{referralLink}</p>
            </>
          ) : (
            <Link href="/memberships" className="mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              Return to memberships
            </Link>
          )}
        </aside>
      </div>
    </section>
  );
}
