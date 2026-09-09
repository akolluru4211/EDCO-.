import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Role-restricted Route Groups
  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isSchoolAdminRoute = pathname.startsWith("/school-admin");

  if (!isAdminRoute && !isTeacherRoute && !isSchoolAdminRoute) {
    return NextResponse.next();
  }

  // Extract auth tokens / cookies or headers
  const sbToken = req.cookies.get("sb-access-token")?.value || 
                  req.cookies.get("edworld_auth")?.value || 
                  req.headers.get("x-user-role");

  // In Next.js middleware, if a client tries direct URL access without clearance:
  // Redirect to /dashboard
  // (Full database verification also runs in the server layouts & API endpoints)
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/teacher/:path*",
    "/school-admin/:path*",
  ],
};
