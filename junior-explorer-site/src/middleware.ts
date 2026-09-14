import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Allow static files and internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const rawHost = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const host = rawHost.toLowerCase().split(":")[0];

  // If host is explorer subdomain, rewrite root to /explorer
  if (host.startsWith("explorer.")) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/explorer", req.url));
    }
  }

  // If host is junior subdomain, rewrite root to /junior
  if (host.startsWith("junior.")) {
    if (pathname === "/" || pathname === "") {
      return NextResponse.rewrite(new URL("/junior", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
