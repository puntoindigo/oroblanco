"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const result = await signIn("credentials", {
      email: data.get("email"),
      password: data.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email o contraseña incorrectos");
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
            <div className="w-9 h-9 rounded bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E]">
              OB
            </div>
            <div className="text-left">
              <div className="text-white font-bold tracking-wide text-base">ORO BLANCO</div>
              <div className="text-[#C9A84C] text-[10px] tracking-widest uppercase">
                Admin
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoFocus
              className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
              placeholder="admin@empresa.com"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A84C] text-[#0F1A2E] font-bold py-3 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
