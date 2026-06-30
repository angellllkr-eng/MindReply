import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isRedirectedPublicPath } from "@/lib/decision-layer";

const allowedApiPaths = new Set(["/api/health", "/api/intake", "/api/agent", "/api/mcp", "/api/version"]);
const privatePaths = [
  "/dashboard",
  "/deployments",
  "/runs",
  "/connectors",
  "/approvals",
  "/incidents",
  "/logs",
  "/settings",
  "/api/deployments",
  "/api/runs",
  "/api/connectors",
  "/api/approvals",
  "/api/logs",
  "/api/vercel",
];

function isPrivatePath(pathname: string) {
  return privatePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default auth((req: NextRequest & { auth?: { user?: unknown } }) => {
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

  if (isPrivatePath(req.nextUrl.pathname) && !req.auth?.user) {
    const signInUrl = new URL("/sign-in", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  if (req.nextUrl.pathname.startsWith("/api/") && !allowedApiPaths.has(req.nextUrl.pathname) && !isPrivatePath(req.nextUrl.pathname)) {
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
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
