import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { absoluteUrl, seoMarketKeywords, solutionPages, targetMarkets } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function findSolution(slug: string) {
  return solutionPages.find((page) => page.slug === slug);
}

export function generateStaticParams() {
  return solutionPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = findSolution(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    keywords: [
      page.audience,
      page.title,
      ...page.useCases,
      ...seoMarketKeywords,
    ],
    alternates: { canonical: absoluteUrl(`/solutions/${page.slug}`) },
    other: {
      "market:primary": targetMarkets.filter((market) => market.priority === "primary").map((market) => market.country).join(", "),
      "market:growth": targetMarkets.filter((market) => market.priority === "growth").map((market) => market.country).join(", "),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteUrl(`/solutions/${page.slug}`),
      type: "website",
    },
  };
}

export default async function SolutionLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = findSolution(slug);
  if (!page) notFound();

  const related = solutionPages.filter((item) => item.slug !== page.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.description,
    provider: {
      "@type": "Organization",
      name: "MindReply",
      url: absoluteUrl("/"),
    },
    areaServed: targetMarkets.map((market) => ({
      "@type": "Country",
      name: market.country,
    })),
    audience: {
      "@type": "Audience",
      audienceType: page.audience,
    },
    url: absoluteUrl(`/solutions/${page.slug}`),
  };

  return (
    <main className="pt-20 min-h-screen" style={{ background: "hsl(40 33% 97%)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="px-4 py-20" style={{ background: "hsl(220 55% 20%)" }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>
            {page.audience}
          </p>
          <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight md:text-6xl" style={{ color: "hsl(43 70% 88%)" }}>
            {page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "rgba(248,245,240,0.74)" }}>
            {page.description}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "rgba(248,245,240,0.62)" }}>
            Operating worldwide for UK, US, Canadian, Australian, German, Singaporean, Indian, and international professional teams.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={page.primaryHref} className="inline-flex justify-center rounded-lg px-6 py-3.5 text-sm font-semibold" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              {page.primaryLabel}
            </Link>
            <Link href="/memberships" className="inline-flex justify-center rounded-lg border px-6 py-3.5 text-sm font-semibold" style={{ borderColor: "rgba(248,245,240,0.28)", color: "hsl(43 70% 88%)" }}>
              View Memberships
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>
              Commercial Problem
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: "hsl(220 45% 13%)" }}>
              What MindReply fixes
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
              {page.pain}
            </p>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "hsl(220 25% 45%)" }}>
              {page.offer}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {page.proofPoints.map((point) => (
              <div key={point} className="rounded-lg border bg-white p-5" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <p className="text-sm font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y px-4 py-16" style={{ borderColor: "hsl(40 25% 88%)", background: "white" }}>
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>
            High-intent Use Cases
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {page.useCases.map((useCase) => (
              <div key={useCase} className="rounded-lg p-5" style={{ background: "hsl(40 20% 96%)" }}>
                <p className="text-sm font-medium" style={{ color: "hsl(220 45% 13%)" }}>{useCase}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl p-8 md:flex md:items-center md:justify-between" style={{ background: "hsl(220 45% 13%)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(43 80% 60%)" }}>Start revenue workflow</p>
              <h2 className="mt-3 font-serif text-3xl font-bold" style={{ color: "hsl(43 70% 88%)" }}>Turn one sensitive message into a paid workflow.</h2>
            </div>
            <Link href={page.primaryHref} className="mt-6 inline-flex rounded-lg px-6 py-3 text-sm font-semibold md:mt-0" style={{ background: "hsl(43 80% 60%)", color: "hsl(220 45% 13%)" }}>
              {page.primaryLabel}
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} href={`/solutions/${item.slug}`} className="rounded-lg border bg-white p-5 transition hover:border-[hsl(43_80%_60%)]" style={{ borderColor: "hsl(40 25% 88%)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(43 80% 60%)" }}>{item.audience}</p>
                <p className="mt-2 text-sm font-semibold" style={{ color: "hsl(220 45% 13%)" }}>{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
