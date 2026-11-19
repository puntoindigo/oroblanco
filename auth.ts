import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** Emails autorizados por env var como fallback de bootstrap (separados por coma) */
function bootstrapEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function isAllowed(email: string): Promise<boolean> {
  const lc = email.toLowerCase();

  // Chequeo rápido contra env var (siempre disponible, sin DB)
  if (bootstrapEmails().includes(lc)) return true;

  // Luego consulta la tabla AdminUser
  try {
    const u = await prisma.adminUser.findUnique({ where: { email: lc } });
    return !!u;
  } catch {
    // Si la DB no está disponible, solo se acepta el email de bootstrap
    return false;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { prompt: "select_account" },
      },
    }),
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;
        if (!(await isAllowed(email))) return null;
        const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
        if (!hash) return null;
        const valid = await bcrypt.compare(password, hash);
        if (!valid) return null;
        return { id: "1", name: "Admin", email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google sign-in: verificar email autorizado
      if (account?.provider === "google") {
        const email = user.email ?? "";
        if (!email) return false;
        if (!(await isAllowed(email))) {
          return "/admin/login?error=unauthorized";
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt" },
});
