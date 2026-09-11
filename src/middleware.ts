import { NextRequest, NextResponse } from "next/server";

// Public page paths accessible without authentication
const PUBLIC_PAGE_PREFIXES = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
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

  // 2. Allow root landing page
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 3. Allow public pages
  const isPublicPage = PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 4. Check API endpoints
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

  // 5. Protected Page Routes (/dashboard, /employee, /hr, /founder, /admin, /profile, etc.)
  const sessionToken =
    req.cookies.get("edworld_session")?.value ||
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("edworld_auth")?.value;

  if (!sessionToken) {
    // Unauthenticated user attempting protected route: Redirect immediately to /auth/login
    const loginUrl = new URL("/auth/login", req.url);
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
