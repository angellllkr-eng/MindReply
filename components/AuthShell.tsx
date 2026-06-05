import Link from "next/link";

const clerkAppearance = {
  variables: {
    colorBackground: "hsl(220 45% 13%)",
    colorText: "hsl(43 70% 88%)",
    colorPrimary: "hsl(43 80% 60%)",
    colorInputBackground: "hsl(220 55% 20%)",
    colorInputText: "hsl(43 70% 88%)",
    colorNeutral: "hsl(220 25% 70%)",
    borderRadius: "12px",
  },
  elements: {
    rootBox: "w-full max-w-full",
    cardBox: "w-full max-w-full shadow-2xl",
    card: "w-full max-w-full border border-[rgba(201,169,97,0.22)]",
    headerTitle: "font-serif",
    formButtonPrimary: "font-semibold",
  },
};

export { clerkAppearance };

export function AuthLogo({ subtitle }: { subtitle: string }) {
  return (
    <div className="text-center">
      <Link
        href="/"
        className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg shadow-sm"
        style={{ background: "linear-gradient(135deg, hsl(43 80% 60%), hsl(43 45% 44%))", color: "hsl(220 45% 13%)" }}
      >
        <span className="font-serif text-xl font-bold">M</span>
      </Link>
      <p className="font-serif text-2xl font-semibold" style={{ color: "hsl(43 70% 88%)" }}>MindReply</p>
      <p className="mt-1 text-xs" style={{ color: "rgba(248,245,240,0.65)" }}>{subtitle}</p>
    </div>
  );
}

export function AuthShell({ children, subtitle }: { children: React.ReactNode; subtitle: string }) {
  return (
    <main className="min-h-screen px-4 pb-12 pt-24 sm:pt-28" style={{ background: "hsl(220 55% 20%)" }}>
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>Member Access</p>
          <h1 className="max-w-xl font-serif text-5xl font-bold leading-tight" style={{ color: "hsl(43 70% 88%)" }}>
            Enter the MindReply communication workspace.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: "rgba(248,245,240,0.68)" }}>
            Continue to tools, professional booking, lexicons, analytics, and executive communication workflows.
          </p>
          <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
            {["Secure access", "Private tools", "Premium network"].map((item) => (
              <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4 text-xs font-semibold text-[hsl(43_70%_88%)]">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
          <AuthLogo subtitle={subtitle} />
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthNotConfigured({ label }: { label: string }) {
  return (
    <div className="w-full rounded-2xl border bg-white p-5 text-center shadow-2xl sm:p-8" style={{ borderColor: "rgba(201,169,97,0.22)" }}>
      <h1 className="font-serif text-2xl font-bold mb-3" style={{ color: "hsl(220 45% 13%)" }}>{label}</h1>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "hsl(220 25% 45%)" }}>
        Authentication is not configured yet. Add Clerk publishable and secret keys to enable secure MindReply account access.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/memberships" className="inline-flex justify-center rounded-lg px-5 py-3 text-sm font-semibold hover:opacity-90" style={{ background: "hsl(220 55% 20%)", color: "hsl(43 70% 88%)" }}>
          View Memberships
        </Link>
        <Link href="/" className="inline-flex justify-center rounded-lg border px-5 py-3 text-sm font-semibold hover:opacity-90" style={{ borderColor: "hsl(40 25% 88%)", color: "hsl(220 55% 20%)" }}>
          Back to Home
      </Link>
      </div>
    </div>
  );
}
