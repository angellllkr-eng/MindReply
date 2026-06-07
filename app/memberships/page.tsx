"use client";
import { useEffect, useState } from "react";
import { Check, Star } from "lucide-react";

type Membership = { id: number; tier: string; name: string; price: number; description: string; features: string[]; highlighted: boolean };

export default function Memberships() {
  const [tiers, setTiers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    fetch("/api/memberships").then((r) => r.json()).then((d) => {
      const order = ["curator", "strategist", "sovereign"];
      const tierOrder = ["signal", "growth", "pro", ...order];
      setTiers([...d].sort((a: Membership, b: Membership) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function startCheckout(tier: string) {
    if (tier === "signal") {
      window.location.href = "/sign-up";
      return;
    }

    setCheckoutTier(tier);
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        setCheckoutError(data.error ?? "Checkout is not available yet. Please contact MindReply for access.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setCheckoutError("Checkout is not available right now. Please contact MindReply for access.");
    } finally {
      setCheckoutTier(null);
    }
  }

  return (
    <div className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <div className="py-16 px-4 text-center" style={{ background: "hsl(220 55% 20%)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(43 80% 60%)" }}>Operational Composure System</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4" style={{ color: "hsl(43 70% 88%)" }}>Signal to Growth to Pro</h1>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(248,245,240,0.7)" }}>
          MindReply is a private AI communication workspace for founders, agencies, teams, and premium individuals who need complex work handled with precision, privacy, and calm.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            { title: "Primary revenue lever", desc: "Convert free Signal users into Growth at GBP 49/mo, then move Growth users to Pro at GBP 129/mo when memory, lexicons, and priority review become essential." },
            { title: "Why it works in 60 days", desc: "The fastest revenue is not a new product; it is upgrading users already feeling the workflow value, context pressure, and collaboration need." },
            { title: "Trust proof", desc: "Fast message resolution, voice fidelity, and AES-256 privacy positioning make the upgrade feel operational, not decorative." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
              <h2 className="font-serif text-xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mb-10 rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: "hsl(40 25% 88%)" }}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Growth trigger", desc: "30 days context memory gives Signal users a clear reason to upgrade before their working context disappears." },
              { title: "Pro trigger", desc: "Unlimited memory plus specialist lexicons and priority review unlock the real productivity layer for daily communication pressure." },
              { title: "Pro-only value", desc: "Character Profiles and Momentum Clarity justify GBP 129/mo because they compound relationship context and decision movement." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl p-3" style={{ background: "hsl(40 33% 97%)" }}>
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
                  <Check size={16} />
                </span>
                <div className="text-left">
                  <h2 className="text-sm font-bold" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white border border-[hsl(40_25%_88%)] rounded-2xl p-8 animate-pulse h-96" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((m) => (
              <div key={m.id} className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${m.highlighted ? "shadow-2xl scale-105 border-2 border-[hsl(43_80%_60%)]" : "bg-white border border-[hsl(40_25%_88%)] hover:border-[hsl(43_80%_60%_/_0.4)] hover:shadow-lg"}`}
                style={m.highlighted ? { background: "hsl(220 55% 20%)" } : {}}>
                {m.highlighted && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-b-lg flex items-center gap-1" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
                      <Star size={9} /> Most Popular
                    </div>
                  </div>
                )}
                <div className={`p-8 ${m.highlighted ? "pt-10" : ""}`}>
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${m.highlighted ? "text-[hsl(43_80%_60%)]" : "text-[hsl(220_25%_45%)]"}`}>{m.tier}</p>
                  <h3 className={`font-serif text-2xl font-bold ${m.highlighted ? "text-[hsl(43_70%_88%)]" : "text-[hsl(220_45%_13%)]"}`}>{m.name}</h3>
                  <div className="my-5">
                    <span className={`font-serif text-5xl font-bold ${m.highlighted ? "text-[hsl(43_70%_88%)]" : "text-[hsl(220_45%_13%)]"}`}>{m.price === 0 ? "Free" : `GBP ${m.price}`}</span>
                    {m.price > 0 && <span className={`text-sm ml-1 ${m.highlighted ? "text-[rgba(248,245,240,0.6)]" : "text-[hsl(220_25%_45%)]"}`}>/month</span>}
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 ${m.highlighted ? "text-[rgba(248,245,240,0.7)]" : "text-[hsl(220_25%_45%)]"}`}>{m.description}</p>
                  <ul className="space-y-3 mb-8">
                    {(m.features as string[]).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <Check size={15} className={`flex-shrink-0 mt-0.5 ${m.highlighted ? "text-[hsl(43_80%_60%)]" : "text-emerald-500"}`} />
                        <span className={m.highlighted ? "text-[rgba(248,245,240,0.85)]" : "text-[hsl(220_45%_13%)]"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => startCheckout(m.tier)} disabled={checkoutTier === m.tier} className={`w-full font-semibold py-3.5 rounded-xl text-sm transition-all disabled:opacity-50 ${m.highlighted ? "hover:opacity-90" : "border-2 hover:text-[hsl(43_70%_88%)] transition-colors"}`}
                    style={m.highlighted ? { background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" } : { borderColor: "hsl(220 55% 20%)", color: "hsl(220 55% 20%)" }}>
                    {checkoutTier === m.tier ? "Opening checkout..." : m.tier === "signal" ? "Start Signal Free" : `Upgrade to ${m.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {checkoutError && (
          <p className="mt-6 rounded-lg border px-4 py-3 text-center text-sm" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
            {checkoutError}
          </p>
        )}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { title: "Cancel anytime", desc: "No lock-in. Upgrade, downgrade, or cancel with 30 days notice." },
            { title: "Instant access", desc: "Your tools, lexicons, and benefits are active the moment you join." },
            { title: "Privacy guaranteed", desc: "All sessions encrypted. Data retention at your discretion." },
          ].map((item) => (
            <div key={item.title} className="p-6">
              <h4 className="font-semibold text-sm mb-2" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
