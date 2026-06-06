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
  entitlement?: {
    tier: string;
    name: string;
    creditsMonthly: number | "unlimited";
    deliveredProducts: string[];
  };
  fulfillment?: {
    persisted: boolean;
    reason?: string | null;
  };
};

type StoredMembership = {
  tier: string;
  confirmed: boolean;
  activatedAt: string;
  entitlement?: SessionState["entitlement"];
  serverPersisted?: boolean;
};

type StoredCredits = {
  balance: number;
  activatedAt: string;
  lastSessionId?: string | null;
};

type StoredRescue = {
  confirmed: boolean;
  activatedAt: string;
  lastSessionId?: string | null;
  messages: number;
  deliveryMinutes: number;
};

type CreditSessionState = {
  configured: boolean;
  confirmed: boolean;
  status: string;
  paymentStatus: string;
  credits: number | null;
  fulfillment?: {
    persisted: boolean;
    reason?: string | null;
  };
};

type RescueSessionState = {
  configured: boolean;
  confirmed: boolean;
  status: string;
  paymentStatus: string;
  offer: {
    slug: string;
    name: string;
    shortName: string;
    price: number;
    amount: number;
    currency: string;
    messages: number;
    deliveryMinutes: number;
  };
  fulfillment?: {
    persisted: boolean;
    reason?: string | null;
  };
};

const tierLabels: Record<string, string> = {
  signal: "Signal",
  growth: "Growth",
  pro: "Pro",
  curator: "Curator",
  strategist: "Strategist",
  sovereign: "Sovereign",
};

const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const googleAdsCheckoutConversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const productAccess = [
  { href: "/rescue/workspace", title: "Message Rescue Workspace", body: "Paste the difficult messages and leave with send-ready wording." },
  { href: "/tools/email-polisher", title: "Email Polisher", body: "Send high-trust messages with calmer executive language." },
  { href: "/tools/text-refiner", title: "Text Refiner", body: "Shape notes into composed, intentional communication." },
  { href: "/lexicons", title: "Specialist Lexicons", body: "Use clinical, legal, finance, and executive language patterns." },
  { href: "/dashboard/analytics", title: "Behavioral Analytics", body: "Track clarity, trust, tone, and response energy." },
];

function normalizeTier(value: string | null) {
  const tier = String(value ?? "").toLowerCase();
  return tierLabels[tier] ? tier : "growth";
}

function emitConfirmedCheckoutConversion(data: SessionState) {
  const browser = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };

  browser.dataLayer = browser.dataLayer || [];
  browser.dataLayer.push({
    event: "membership_checkout_success",
    membership_tier: data.tier,
    payment_status: data.paymentStatus,
    server_persisted: Boolean(data.fulfillment?.persisted),
  });

  if (googleAdsId && googleAdsCheckoutConversionLabel && browser.gtag) {
    browser.gtag("event", "conversion", {
      send_to: `${googleAdsId}/${googleAdsCheckoutConversionLabel}`,
      membership_tier: data.tier,
    });
  }

  if (metaPixelId && browser.fbq) {
    browser.fbq("track", "Subscribe", {
      content_name: "MindReply Membership",
      content_category: data.tier,
    });
  }
}

function emitCreditCheckoutConversion(credits: number) {
  const browser = window as Window & {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  };

  browser.dataLayer = browser.dataLayer || [];
  browser.dataLayer.push({
    event: "credit_checkout_success",
    credits,
  });

  if (metaPixelId && browser.fbq) {
    browser.fbq("track", "Purchase", {
      content_name: "MindReply Credits",
      content_category: "Micro-tool credits",
      value: credits === 20 ? 29 : 9,
      currency: "GBP",
    });
  }
}

function emitRescueCheckoutConversion(data: RescueSessionState) {
  const browser = window as Window & {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  };

  browser.dataLayer = browser.dataLayer || [];
  browser.dataLayer.push({
    event: "message_rescue_checkout_success",
    offer: data.offer.slug,
    messages: data.offer.messages,
    delivery_minutes: data.offer.deliveryMinutes,
    value: data.offer.price,
  });

  if (metaPixelId && browser.fbq) {
    browser.fbq("track", "Purchase", {
      content_name: data.offer.name,
      content_category: "Message rescue",
      value: data.offer.price,
      currency: data.offer.currency.toUpperCase(),
    });
  }
}

export default function PurchaseSuccessPanel() {
  const params = useSearchParams();
  const checkout = params.get("checkout");
  const sessionId = params.get("session_id");
  const requestedTier = normalizeTier(params.get("tier"));
  const requestedCredits = Number(params.get("credits") || 0);
  const [session, setSession] = useState<SessionState | null>(null);
  const [creditSession, setCreditSession] = useState<CreditSessionState | null>(null);
  const [rescueSession, setRescueSession] = useState<RescueSessionState | null>(null);
  const [storedMembership, setStoredMembership] = useState<StoredMembership | null>(null);
  const [storedCredits, setStoredCredits] = useState<StoredCredits | null>(null);
  const [storedRescue, setStoredRescue] = useState<StoredRescue | null>(null);
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

    const creditState = window.localStorage.getItem("mindreply.credits");
    if (creditState) {
      try {
        setStoredCredits(JSON.parse(creditState) as StoredCredits);
      } catch {
        window.localStorage.removeItem("mindreply.credits");
      }
    }

    const rescueState = window.localStorage.getItem("mindreply.rescue");
    if (rescueState) {
      try {
        setStoredRescue(JSON.parse(rescueState) as StoredRescue);
      } catch {
        window.localStorage.removeItem("mindreply.rescue");
      }
    }
  }, []);

  useEffect(() => {
    if (checkout !== "credits_success") return;

    if (!sessionId) {
      setCreditSession({
        configured: true,
        confirmed: false,
        status: "missing_session_id",
        paymentStatus: "unknown",
        credits: requestedCredits || null,
        fulfillment: { persisted: false, reason: "missing_session_id" },
      });
      return;
    }

    const saved = window.localStorage.getItem("mindreply.credits");
    let prior: StoredCredits | null = null;
    if (saved) {
      try {
        prior = JSON.parse(saved) as StoredCredits;
      } catch {
        window.localStorage.removeItem("mindreply.credits");
      }
    }
    if (sessionId && prior?.lastSessionId === sessionId) {
      setStoredCredits(prior);
      return;
    }

    const controller = new AbortController();
    const search = new URLSearchParams({ session_id: sessionId });
    if (requestedCredits) search.set("credits", String(requestedCredits));

    setCreditSession({
      configured: true,
      confirmed: false,
      status: "checking",
      paymentStatus: "checking",
      credits: requestedCredits || null,
    });

    fetch(`/api/checkout/credits-session?${search.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: CreditSessionState) => {
        setCreditSession(data);
        if (!data.confirmed || !data.credits) return;

        const current = Number(prior?.balance ?? 0);
        const nextCredits = {
          balance: current + data.credits,
          activatedAt: new Date().toISOString(),
          lastSessionId: sessionId,
        };
        window.localStorage.setItem("mindreply.credits", JSON.stringify(nextCredits));
        setStoredCredits(nextCredits);
        emitCreditCheckoutConversion(data.credits);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setCreditSession({
            configured: true,
            confirmed: false,
            status: "lookup_failed",
            paymentStatus: "unknown",
            credits: requestedCredits || null,
            fulfillment: { persisted: false, reason: "lookup_failed" },
          });
        }
      });

    return () => controller.abort();
  }, [checkout, requestedCredits, sessionId]);

  useEffect(() => {
    if (checkout !== "rescue_success") return;

    if (!sessionId) {
      setRescueSession({
        configured: true,
        confirmed: false,
        status: "missing_session_id",
        paymentStatus: "unknown",
        offer: {
          slug: "message-overload-rescue",
          name: "Message Overload Rescue",
          shortName: "Message Rescue",
          price: 49,
          amount: 4900,
          currency: "gbp",
          messages: 3,
          deliveryMinutes: 15,
        },
        fulfillment: { persisted: false, reason: "missing_session_id" },
      });
      return;
    }

    const saved = window.localStorage.getItem("mindreply.rescue");
    let prior: StoredRescue | null = null;
    if (saved) {
      try {
        prior = JSON.parse(saved) as StoredRescue;
      } catch {
        window.localStorage.removeItem("mindreply.rescue");
      }
    }
    if (sessionId && prior?.lastSessionId === sessionId && prior.confirmed) {
      setStoredRescue(prior);
      return;
    }

    const controller = new AbortController();
    const search = new URLSearchParams({ session_id: sessionId });

    setRescueSession({
      configured: true,
      confirmed: false,
      status: "checking",
      paymentStatus: "checking",
      offer: {
        slug: "message-overload-rescue",
        name: "Message Overload Rescue",
        shortName: "Message Rescue",
        price: 49,
        amount: 4900,
        currency: "gbp",
        messages: 3,
        deliveryMinutes: 15,
      },
    });

    fetch(`/api/checkout/rescue-session?${search.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: RescueSessionState) => {
        setRescueSession(data);
        if (!data.confirmed) return;

        const rescue = {
          confirmed: true,
          activatedAt: new Date().toISOString(),
          lastSessionId: sessionId,
          messages: data.offer.messages,
          deliveryMinutes: data.offer.deliveryMinutes,
        };
        window.localStorage.setItem("mindreply.rescue", JSON.stringify(rescue));
        setStoredRescue(rescue);
        emitRescueCheckoutConversion(data);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRescueSession({
            configured: true,
            confirmed: false,
            status: "lookup_failed",
            paymentStatus: "unknown",
            offer: {
              slug: "message-overload-rescue",
              name: "Message Overload Rescue",
              shortName: "Message Rescue",
              price: 49,
              amount: 4900,
              currency: "gbp",
              messages: 3,
              deliveryMinutes: 15,
            },
            fulfillment: { persisted: false, reason: "lookup_failed" },
          });
        }
      });

    return () => controller.abort();
  }, [checkout, sessionId]);

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
          emitConfirmedCheckoutConversion(data);
          const membership = {
            tier: data.tier,
            confirmed: true,
            activatedAt: new Date().toISOString(),
            entitlement: data.entitlement,
            serverPersisted: Boolean(data.fulfillment?.persisted),
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
  const isCreditReturn = checkout === "credits_success";
  const isRescueReturn = checkout === "rescue_success";
  const activeCredits = Boolean(storedCredits?.balance);
  const activeRescue = Boolean(storedRescue?.confirmed);
  const activeProduct = Boolean(activeMembership || activeCredits || activeRescue);
  const serverPersisted = Boolean(session?.fulfillment?.persisted || storedMembership?.serverPersisted);
  const deliveryStatus = activeRescue
    ? `${storedRescue?.messages ?? 3} payment-verified Message Rescue slots active in this dashboard`
    : activeCredits
    ? "Payment-verified tool credits active in this dashboard"
    : isRescueReturn
    ? `Message Rescue verification: ${rescueSession?.status ?? "checking"}`
    : isCreditReturn
    ? `Credit verification: ${creditSession?.status ?? "checking"}`
    : serverPersisted
    ? "Server entitlement recorded"
    : "Access active in this dashboard";

  if (!isCheckoutReturn && !isCreditReturn && !isRescueReturn && !activeMembership && !activeCredits && !activeRescue) return null;

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
            {activeRescue ? "Message Rescue unlocked" : activeCredits ? "Tool credits activated" : isRescueReturn ? "Message Rescue verification" : isCreditReturn ? "Credit payment verification" : activeMembership ? "Access activated" : "Payment check in progress"}
          </div>
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">
            {activeRescue ? `${storedRescue?.messages ?? 3} messages ready to handle` : activeCredits ? `${storedCredits?.balance ?? requestedCredits} credits ready` : isRescueReturn ? "Confirming your Message Rescue" : isCreditReturn ? "Confirming your credits" : activeMembership ? `${activeTier} membership confirmed` : "Confirming your membership"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[rgba(248,245,240,0.72)]">
            {activeRescue
              ? `Your Message Rescue is active. Open a writing tool or MRagent, paste the stuck message, and turn pressure into send-ready wording within ${storedRescue?.deliveryMinutes ?? 15} minutes.`
              : activeCredits
              ? "Your micro-tool credits are ready now. Open a tool, refine the message, and turn the next sensitive communication into a prepared professional signal."
              : isRescueReturn
              ? "Payment verification is running. Once the checkout session is confirmed, your Message Rescue activates in this dashboard."
              : isCreditReturn
              ? "Payment verification is running. Once the credit checkout session is confirmed, your credits activate in this dashboard."
              : activeMembership
              ? "Your product path is ready now: refine the message, choose the right behavioral frame, and turn the next conversation into a trust signal."
              : "Payment verification is running. Once the checkout session is confirmed, your product access activates in this dashboard."}
          </p>
          {(activeMembership || activeCredits || activeRescue || isCreditReturn || isRescueReturn) && (
            <p className="mt-3 inline-flex rounded-full border border-[rgba(248,245,240,0.14)] px-3 py-1.5 text-xs font-semibold text-[rgba(248,245,240,0.7)]">
              {deliveryStatus}
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {productAccess.map((item) => (
              <Link key={item.href} href={activeProduct ? item.href : "/memberships"} className={`rounded-xl border border-[rgba(248,245,240,0.12)] bg-white/[0.04] p-4 transition hover:border-[hsl(43_80%_60%)] hover:bg-white/[0.07] ${activeProduct ? "" : "opacity-70"}`}>
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
          <h3 className="font-serif text-xl font-bold">{activeProduct ? "Bring the next high-trust mind in" : "Verification checkpoint"}</h3>
          <p className="mt-2 text-sm leading-6 text-[rgba(248,245,240,0.68)]">
            {activeProduct
              ? "People copy calm authority. Share MindReply with one colleague who handles sensitive decisions and let the network compound."
              : "If this state stays visible, return to memberships or the rescue offer to restart checkout."}
          </p>
          {activeProduct ? (
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
