import { NextRequest, NextResponse } from "next/server";
import { evaluateFirewall } from "@/lib/firewall/waf";

// Subdomain to Sector Map (Main App handles Career track; Junior/Explorer deployed standalone)
const SUBDOMAIN_SECTOR_MAP: Record<string, string> = {
  "career.edworldco.in": "career",
  "career.edworld.co.in": "career",
  "student.edworldco.in": "career",
  "student.edworld.co.in": "career",
  "working.edworldco.in": "career",
  "working.edworld.co.in": "career",
  // Local development / test aliases
  "career.localhost": "career",
  "student.localhost": "career",
  "working.localhost": "career",
};

// Public page paths accessible without authentication
const PUBLIC_PAGE_PREFIXES = [
  "/login",
  "/signup",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/for-career",
  "/for-college",
  "/for-professionals",
  "/sector-landing",
  "/privacy",
  "/terms",
  "/feedback",
  "/about",
  "/contact",
  "/pricing",
  "/consent/verify",
];

// Public API endpoints accessible without authentication
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/otp/send",
  "/api/auth/otp/verify",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/auth/session",
  "/api/health",
  "/api/landing",
  "/api/billing/webhook",
  "/api/jobs/maintenance",
];

// Apply hardened security & data protection headers to responses
function applySecurityHeaders(res: NextResponse, requestId: string): NextResponse {
  res.headers.set("x-request-id", requestId);
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  return res;
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let requestId = req.headers.get("x-request-id");
  if (!requestId) {
    try {
      requestId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" 
        ? crypto.randomUUID() 
        : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    } catch {
      requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  // 1. Always allow static files, internal Next.js assets, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.startsWith("/robots.txt")
  ) {
    const res = NextResponse.next();
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // 2. Web Application Firewall (WAF) Request Inspection
  const wafResult = evaluateFirewall(req);
  if (wafResult.blocked) {
    const isApi = pathname.startsWith("/api");
    if (isApi) {
      const blockedRes = NextResponse.json(
        {
          success: false,
          error: {
            code: "FIREWALL_BLOCKED",
            message: wafResult.reason || "Access blocked by application security firewall.",
            threat_type: wafResult.threatType,
            request_id: requestId,
          },
        },
        { status: wafResult.statusCode || 403 }
      );
      return applySecurityHeaders(blockedRes, requestId);
    } else {
      const blockedHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>403 Request Blocked | Edworld Co</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:#0a0a0a;color:#ededed;font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px}.box{max-width:480px;background:#141414;border:1px solid #262626;border-radius:16px;padding:32px;text-align:center}h1{font-size:20px;color:#f43f5e;margin:0 0 12px}p{font-size:14px;color:#a3a3a3;line-height:1.5;margin:0 0 24px}.badge{display:inline-block;padding:4px 12px;border-radius:999px;background:#262626;font-size:12px;font-family:monospace;color:#d4d4d4}</style></head><body><div class="box"><h1>403 Request Blocked by Firewall</h1><p>${wafResult.reason || "Malicious injection syntax was detected in this request."}</p><div class="badge">Reference ID: ${requestId}</div></div></body></html>`;
      const blockedRes = new NextResponse(blockedHtml, {
        status: wafResult.statusCode || 403,
        headers: { "Content-Type": "text/html" },
      });
      return applySecurityHeaders(blockedRes, requestId);
    }
  }

  // 3. Subdomain Routing: Check Host header
  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = rawHost.toLowerCase().split(":")[0];
  const matchedSector = SUBDOMAIN_SECTOR_MAP[host];

  if (matchedSector) {
    // If visitor visits root on subdomain, rewrite internally to /sector-landing/[sector]
    if (pathname === "/" || pathname === "") {
      const rewriteUrl = new URL(`/sector-landing/${matchedSector}`, req.url);
      const res = NextResponse.rewrite(rewriteUrl);
      return applySecurityHeaders(res, requestId);
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
    const res = NextResponse.next();
    return applySecurityHeaders(res, requestId);
  }

  // 4. Allow public pages
  const isPublicPage = PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublicPage) {
    const res = NextResponse.next();
    return applySecurityHeaders(res, requestId);
  }

  // 5. Check API endpoints
  if (pathname.startsWith("/api")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isPublicApi) {
      const res = NextResponse.next();
      return applySecurityHeaders(res, requestId);
    }

    // Protected API: Check for session cookie, authorization bearer token, or internal service secret
    const hasSessionCookie =
      req.cookies.has("edworld_session") ||
      req.cookies.has("sb-access-token") ||
      req.cookies.has("edworld_auth");
    
    const internalSecret = process.env.INTERNAL_SERVICE_SECRET || "edworld-internal-k8s-secret-2026";
    const hasInternalAuth = req.headers.get("x-internal-secret") === internalSecret;
    const hasBearerToken = req.headers.has("authorization");

    if (!hasSessionCookie && !hasBearerToken && !hasInternalAuth) {
      const errRes = NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_REQUIRED",
            message: "Unauthorized: Valid authentication session required to access this resource.",
            request_id: requestId
          }
        },
        {
          status: 401,
          headers: {
            "x-request-id": requestId,
            "Cache-Control": "no-store"
          }
        }
      );
      return applySecurityHeaders(errRes, requestId);
    }

    const res = NextResponse.next();
    return applySecurityHeaders(res, requestId);
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

  // Add strict security and data protection firewall headers
  const response = NextResponse.next();
  return applySecurityHeaders(response, requestId);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
