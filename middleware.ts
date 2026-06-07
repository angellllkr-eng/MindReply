import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { detectLanguageFromAcceptLanguage, detectLanguageFromCountry, normalizeLanguage, type LanguageCode, type LanguageSource } from "@/lib/language";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/bookings(.*)",
  "/orchestrator(.*)",
  "/tasks(.*)",
  "/api/background(.*)",
  "/api/bookings(.*)",
  "/api/agents/execution-queue(.*)",
  "/api/monitoring(.*)",
  "/api/orchestrate(.*)",
  "/api/tasks(.*)",
]);

function detectCountry(req: NextRequest) {
  return (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country-code") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-appengine-country") ||
    null
  );
}

function detectRequestLanguage(req: NextRequest) {
  const urlLanguage = normalizeLanguage(req.nextUrl.searchParams.get("lang"));
  if (urlLanguage) return { language: urlLanguage, mode: "auto" as const, source: "url" as LanguageSource };

  const cookieLanguage = normalizeLanguage(req.cookies.get("mindreply.language")?.value ?? null);
  const cookieMode = req.cookies.get("mindreply.languageMode")?.value === "manual" ? "manual" : "auto";
  if (cookieLanguage && cookieMode === "manual") {
    return { language: cookieLanguage, mode: "manual" as const, source: "cookie" as LanguageSource };
  }

  const countryLanguage = detectLanguageFromCountry(detectCountry(req));
  if (countryLanguage) return { language: countryLanguage, mode: "auto" as const, source: "country" as LanguageSource };

  const acceptLanguage = detectLanguageFromAcceptLanguage(req.headers.get("accept-language"));
  if (acceptLanguage) return { language: acceptLanguage, mode: "auto" as const, source: "accept-language" as LanguageSource };

  if (cookieLanguage) return { language: cookieLanguage, mode: "auto" as const, source: "cookie" as LanguageSource };

  return { language: "EN" as LanguageCode, mode: "auto" as const, source: "fallback" as LanguageSource };
}

function languageResponse(req: NextRequest) {
  const detected = detectRequestLanguage(req);
  const country = detectCountry(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-mr-language", detected.language);
  requestHeaders.set("x-mr-language-mode", detected.mode);
  requestHeaders.set("x-mr-language-source", detected.source);
  if (country) requestHeaders.set("x-mr-country", country.toUpperCase());

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (req.nextUrl.searchParams.has("lang") || detected.source === "country" || detected.source === "accept-language") {
    response.cookies.set("mindreply.language", detected.language, { path: "/", sameSite: "lax" });
    response.cookies.set("mindreply.languageMode", detected.mode, { path: "/", sameSite: "lax" });
  }
  return response;
}

const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return languageResponse(req);
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const host = req.headers.get("host")?.toLowerCase();
  if (host === "mind-reply.com") {
    const url = req.nextUrl.clone();
    url.hostname = "www.mind-reply.com";
    return NextResponse.redirect(url, 308);
  }

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    if (isProtectedRoute(req)) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return languageResponse(req);
  }

  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
