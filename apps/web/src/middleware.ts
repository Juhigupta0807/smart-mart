import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const isAdmin = request.nextUrl.pathname.startsWith("/admin");
    const url = new URL(isAdmin ? "/admin/login" : "/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/orders/:path*", "/admin", "/admin/((?!login).*)"],
};
