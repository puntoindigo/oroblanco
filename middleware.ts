import { NextRequest, NextResponse } from "next/server";
import { verifyPiSessionCookie, PI_SESSION_COOKIE_NAME } from "@/lib/pi-session";

const ACCOUNTS_URL =
  process.env.ACCOUNTS_URL ?? "https://accounts.puntoindigo.com";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";

  const secret = process.env.PI_SESSION_SECRET ?? "";
  const cookieValue = req.cookies.get(PI_SESSION_COOKIE_NAME)?.value ?? "";
  const hasValidCookie = !!secret && !!verifyPiSessionCookie(cookieValue, secret);

  if (!isLoginPage && !hasValidCookie) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const returnTo = `${appUrl}${pathname}`;
    return NextResponse.redirect(
      `${ACCOUNTS_URL}/login?redirect=${encodeURIComponent(returnTo)}`
    );
  }

  if (isLoginPage && hasValidCookie) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
