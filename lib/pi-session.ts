import crypto from "crypto";

export interface PiSessionPayload {
  email: string;
  name: string | null;
  picture: string | null;
  exp: number;
  role?: string;
  adminProjects?: string[];
}

export const PI_SESSION_COOKIE_NAME = "pi_session";

const toB64 = (buf: Buffer | string) =>
  (Buffer.isBuffer(buf) ? buf : Buffer.from(buf, "utf8"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64 = (s: string) => {
  const p = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = p.length % 4 ? 4 - (p.length % 4) : 0;
  return Buffer.from(p + "=".repeat(pad), "base64").toString("utf8");
};

export function verifyPiSessionCookie(token: string, secret: string): PiSessionPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = toB64(crypto.createHmac("sha256", secret).update(body).digest());
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const p = JSON.parse(fromB64(body)) as PiSessionPayload;
    if (!p?.email || !p?.exp) return null;
    if (p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}
