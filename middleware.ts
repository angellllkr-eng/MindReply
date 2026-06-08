import { NextRequest, NextResponse } from "next/server";
import { isRedirectedPublicPath } from "@/lib/decision-layer";

const allowedApiPaths = new Set(["/api/health", "/api/intake"]);

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host")?.toLowerCase();
  if (host === "mind-reply.com") {
    const url = req.nextUrl.clone();
    url.hostname = "www.mind-reply.com";
    return NextResponse.redirect(url, 308);
  }

  if (isRedirectedPublicPath(req.nextUrl.pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  if (req.nextUrl.pathname.startsWith("/api/") && !allowedApiPaths.has(req.nextUrl.pathname)) {
    return NextResponse.json(
      {
        status: "retired",
        service: "mindreply",
        message: "This surface has moved into the decision layer.",
      },
      { status: 410 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
