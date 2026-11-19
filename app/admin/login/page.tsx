"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const errorParam = params.get("error");
  const [pwOpen, setPwOpen] = useState(false);
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isUnauthorized = errorParam === "unauthorized" || errorParam === "AccessDenied";

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/admin" });
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setPwError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setPwError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1A2E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E] text-sm">
              OB
            </div>
            <div className="text-left">
              <div className="text-white font-bold tracking-wide text-lg leading-tight">ORO BLANCO</div>
              <div className="text-[#C9A84C] text-[10px] tracking-widest uppercase">
                Panel de administración
              </div>
            </div>
          </div>
        </div>

        {/* Error de no autorizado */}
        {isUnauthorized && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
            Tu cuenta de Google no está autorizada. Pedile al admin que te agregue.
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 text-sm"
          >
            {/* Google icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? "Redirigiendo..." : "Continuar con Google"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-white/30 text-xs">o</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* Password toggle */}
          {!pwOpen ? (
            <button
              onClick={() => setPwOpen(true)}
              className="w-full text-white/40 text-xs hover:text-white/60 transition-colors py-1"
            >
              Acceso con contraseña →
            </button>
          ) : (
            <form onSubmit={handlePassword} className="space-y-3">
              <input
                name="email"
                type="email"
                required
                autoFocus
                className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/30"
                placeholder="admin@empresa.com"
              />
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/30"
                placeholder="Contraseña"
              />
              {pwError && (
                <p className="text-red-400 text-xs text-center">{pwError}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A84C] text-[#0F1A2E] font-bold py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Ingresar"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-4">
          Solo cuentas autorizadas por el administrador
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
