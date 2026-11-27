import { NextResponse } from "next/server";

export function GET() {
  const accountsUrl = process.env.ACCOUNTS_URL ?? "https://accounts.puntoindigo.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://transporteoroblanco.com";

  // Redirigir a accounts para cerrar la sesión del ecosistema completo
  const response = NextResponse.redirect(
    `${accountsUrl}/api/auth/logout?next=${encodeURIComponent(appUrl + "/admin/login")}`
  );

  // Limpiar la cookie local para cortar cualquier loop de redirección
  response.cookies.set("pi_session", "", {
    domain: ".puntoindigo.com",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });

  return response;
}
