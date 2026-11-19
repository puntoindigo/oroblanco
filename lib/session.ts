import { cookies } from "next/headers";
import { verifyPiSessionCookie, PI_SESSION_COOKIE_NAME, type PiSessionPayload } from "./pi-session";
import { prisma } from "./prisma";

function bootstrapEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function isAllowed(email: string): Promise<boolean> {
  const lc = email.toLowerCase();
  if (bootstrapEmails().includes(lc)) return true;
  try {
    const u = await prisma.adminUser.findUnique({ where: { email: lc } });
    return !!u;
  } catch {
    return false;
  }
}

/** Verifica la cookie pi_session y chequea que el email esté en la allowlist de oroblanco. */
export async function getSession(): Promise<PiSessionPayload | null> {
  const secret = process.env.PI_SESSION_SECRET;
  if (!secret) return null;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(PI_SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  const payload = verifyPiSessionCookie(cookie.value, secret);
  if (!payload) return null;

  if (!(await isAllowed(payload.email))) return null;

  return payload;
}

/** Solo verifica la firma/expiración, sin chequear la allowlist. Para el middleware o pantalla de login. */
export async function getRawSession(): Promise<PiSessionPayload | null> {
  const secret = process.env.PI_SESSION_SECRET;
  if (!secret) return null;

  const cookieStore = await cookies();
  const cookie = cookieStore.get(PI_SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  return verifyPiSessionCookie(cookie.value, secret);
}
