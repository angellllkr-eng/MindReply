import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

const cards = [
  { title: "Deployments", href: "/deployments", copy: "Preview and production deployment status." },
  { title: "Runs", href: "/runs", copy: "Worker executions and recent system jobs." },
  { title: "Approvals", href: "/approvals", copy: "Owner-only action queue and decision gates." },
  { title: "Logs", href: "/logs", copy: "Incident trace and operational receipts." },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-4 py-6 text-[#122033] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#2f6f72]">Owner cockpit</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">MindReply control plane</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59687b]">
              Private operator surface for deploys, workers, approvals, logs, and live system status.
            </p>
          </div>
          <SignOutButton />
        </div>

        <section className="mt-6 rounded-3xl border border-[#122033]/10 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Signed in as" value={session.user.name ?? "Owner"} />
            <Stat label="Access" value="Owner-only" />
            <Stat label="Surface" value="Private" />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-3xl border border-[#122033]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#59687b]">{card.copy}</p>
            </Link>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-[#122033]/10 bg-[#122033] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#91d2c8]">Next action</p>
          <p className="mt-3 text-sm leading-6 text-[#d9e3e7]">
            Keep this surface private, rotate secrets in Vercel and GitHub, then wire live deployment status into the
            cards above.
          </p>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#122033]/10 bg-[#f7f4ed] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a97a8]">{label}</p>
      <p className="mt-2 text-base font-semibold text-[#122033]">{value}</p>
    </div>
  );
}
