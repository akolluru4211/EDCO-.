import { NextRequest, NextResponse } from "next/server";

// Subdomain to Sector Map
const SUBDOMAIN_SECTOR_MAP: Record<string, string> = {
  "junior.edworldco.in": "junior",
  "explorer.edworldco.in": "explorer",
  "student.edworldco.in": "college",
  "working.edworldco.in": "working_professional",
  // Local development / test aliases
  "junior.localhost": "junior",
  "explorer.localhost": "explorer",
  "student.localhost": "college",
  "working.localhost": "working_professional",
};

// Public page paths accessible without authentication
const PUBLIC_PAGE_PREFIXES = [
  "/login",
  "/signup",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/for-junior",
  "/for-explorer",
  "/for-college",
  "/for-professionals",
  "/sector-landing",
  "/privacy",
  "/terms",
  "/feedback",
  "/about",
  "/contact",
  "/pricing",
  "/for-schools",
  "/consent/verify",
];

// Public API endpoints accessible without authentication
const PUBLIC_API_PREFIXES = [
  "/api/auth/otp/send",
  "/api/auth/otp/verify",
  "/api/auth/logout",
  "/api/auth/session",
  "/api/health",
  "/api/landing",
  "/api/billing/webhook",
];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Always allow static files, internal Next.js assets, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt")
  ) {
    return NextResponse.next();
  }

  // 2. Subdomain Routing: Check Host header
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = rawHost.toLowerCase().split(":")[0];
  const matchedSector = SUBDOMAIN_SECTOR_MAP[host];

  if (matchedSector) {
    // If visitor visits root on subdomain (e.g. junior.edworldco.in/), rewrite internally to /sector-landing/[sector]
    if (pathname === "/" || pathname === "") {
      const rewriteUrl = new URL(`/sector-landing/${matchedSector}`, req.url);
      return NextResponse.rewrite(rewriteUrl);
    }

    // If visitor attempts to access auth from a subdomain, redirect to main app domain
    if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth")) {
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "edworldco.in";
      const isLocal = host.endsWith(".localhost");
      if (!isLocal) {
        return NextResponse.redirect(`https://${appDomain}${pathname}${req.nextUrl.search}`);
      }
    }
  }

  // 3. Allow root landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 4. Allow public pages
  const isPublicPage = PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 5. Check API endpoints
  if (pathname.startsWith("/api")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isPublicApi) {
      return NextResponse.next();
    }

    // Protected API: Check for session cookie or authorization header
    const hasSessionCookie =
      req.cookies.has("edworld_session") ||
      req.cookies.has("sb-access-token") ||
      req.cookies.has("edworld_auth");
    const hasAuthHeader = req.headers.has("authorization") || req.headers.has("x-user-id");

    if (!hasSessionCookie && !hasAuthHeader) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required." },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 6. Protected Page Routes (/dashboard, /employee, /hr, /founder, /admin, /profile, etc.)
  const sessionToken =
    req.cookies.get("edworld_session")?.value ||
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("edworld_auth")?.value;

  if (!sessionToken) {
    // Unauthenticated user attempting protected route: Redirect immediately to /login
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
