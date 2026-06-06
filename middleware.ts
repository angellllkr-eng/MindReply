import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/dashboard(.*)",
  "/bookings(.*)",
  "/orchestrator(.*)",
  "/api/background(.*)",
  "/api/bookings(.*)",
  "/api/agents/execution-queue(.*)",
  "/api/monitoring(.*)",
  "/api/orchestrate(.*)",
  "/api/tasks(.*)",
]);

const supportedLanguages = new Set(["EN", "FR", "DE", "ES", "BG", "IT", "PT"]);

function normalizeLanguage(value: string | null) {
  const language = value?.toUpperCase() ?? "";
  return supportedLanguages.has(language) ? language : null;
}

function detectRequestLanguage(req: NextRequest) {
  const urlLanguage = normalizeLanguage(req.nextUrl.searchParams.get("lang"));
  if (urlLanguage) return { language: urlLanguage, mode: "auto" as const };

  const cookieLanguage = normalizeLanguage(req.cookies.get("mindreply.language")?.value ?? null);
  const cookieMode = req.cookies.get("mindreply.languageMode")?.value === "manual" ? "manual" : "auto";
  if (cookieLanguage) return { language: cookieLanguage, mode: cookieMode as "auto" | "manual" };

  const acceptLanguage = req.headers.get("accept-language")?.toLowerCase() ?? "";
  if (/\bfr\b|fr-/.test(acceptLanguage)) return { language: "FR", mode: "auto" as const };
  if (/\bde\b|de-/.test(acceptLanguage)) return { language: "DE", mode: "auto" as const };
  if (/\bes\b|es-/.test(acceptLanguage)) return { language: "ES", mode: "auto" as const };
  if (/\bbg\b|bg-/.test(acceptLanguage)) return { language: "BG", mode: "auto" as const };
  if (/\bit\b|it-/.test(acceptLanguage)) return { language: "IT", mode: "auto" as const };
  if (/\bpt\b|pt-/.test(acceptLanguage)) return { language: "PT", mode: "auto" as const };

  return { language: "EN", mode: "auto" as const };
}

function languageResponse(req: NextRequest) {
  const detected = detectRequestLanguage(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-mr-language", detected.language);
  requestHeaders.set("x-mr-language-mode", detected.mode);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (req.nextUrl.searchParams.has("lang")) {
    response.cookies.set("mindreply.language", detected.language, { path: "/", sameSite: "lax" });
    response.cookies.set("mindreply.languageMode", detected.mode, { path: "/", sameSite: "lax" });
  }
  return response;
}

const authMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
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
