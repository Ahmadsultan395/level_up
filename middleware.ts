import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/authConstants";

/**
 * IMPORTANT: Middleware runs on the Edge Runtime. `jsonwebtoken` and
 * `bcryptjs` are NOT Edge-compatible (they rely on Node.js `crypto`/`Buffer`
 * APIs), and importing anything from "@/lib/auth" here would pull those
 * packages into the Edge bundle even if unused. That's why we import
 * COOKIE_NAME from the dependency-free "@/lib/authConstants" instead.
 *
 * This middleware only does a lightweight "does the auth cookie exist"
 * check. The actual JWT signature/expiry verification happens server-side
 * in Node.js runtime: `getSession()` in the dashboard layout, and
 * `requireAuth()` in API routes.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isLogin = req.nextUrl.pathname.startsWith("/login");

  if (isDashboard && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isLogin && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
