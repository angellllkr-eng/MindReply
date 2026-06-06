import { solutionPages } from "@/lib/seo";

export const solutionLandingEventName = "solution_landing_conversion_intent";

export const analyticsEnvKeys = [
  "NEXT_PUBLIC_GTM_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_ID",
  "NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL",
  "NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL",
  "NEXT_PUBLIC_META_PIXEL_ID",
] as const;

export const solutionLandingPaths = solutionPages.map((page) => `/solutions/${page.slug}`);

export function normalizePathname(pathname: string) {
  const path = pathname.trim() || "/";
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

export function getSolutionLandingAudience(pathname: string) {
  const normalized = normalizePathname(pathname);
  const page = solutionPages.find((item) => `/solutions/${item.slug}` === normalized);
  return page?.slug ?? null;
}
