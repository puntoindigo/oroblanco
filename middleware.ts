import { NextRequest, NextResponse } from "next/server";

const ACCOUNTS_URL =
  process.env.ACCOUNTS_URL ?? "https://accounts.puntoindigo.com";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const hasCookie = !!req.cookies.get("pi_session")?.value;

  if (!isLoginPage && !hasCookie) {
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
    const returnTo = `${appUrl}${pathname}`;
    return NextResponse.redirect(
      `${ACCOUNTS_URL}/login?redirect=${encodeURIComponent(returnTo)}`
    );
  }

  // No redirigimos desde /admin/login aunque haya cookie — dejar que el
  // server component verifique la sesión. Si hiciéramos redirect aquí con
  // una cookie inválida, caeríamos en loop: middleware→/admin→layout→/admin/login→...
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
