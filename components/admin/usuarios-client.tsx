"use client";

import { useState } from "react";

type AdminUser = { id: string; email: string; addedBy: string | null; createdAt: Date };

export default function UsuariosClient({
  dbUsers,
  bootstrapEmails,
  currentEmail,
}: {
  dbUsers: AdminUser[];
  bootstrapEmails: string[];
  currentEmail: string;
}) {
  const [users, setUsers] = useState(dbUsers);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const dbEmails = users.map((u) => u.email);
  const bootstrapOnly = bootstrapEmails.filter((e) => !dbEmails.includes(e));

  async function addUser() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { user?: AdminUser; error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setUsers((prev) => [...prev, data.user!]);
      setNewEmail("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al agregar");
    } finally {
      setAdding(false);
    }
  }

  async function removeUser(id: string, email: string) {
    if (email === currentEmail) {
      alert("No podés quitarte a vos mismo.");
      return;
    }
    if (!confirm(`¿Quitar acceso a ${email}?`)) return;
    await fetch(`/api/admin/usuarios/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Bootstrap emails (env var) */}
      {bootstrapOnly.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
            Autorizados por variable de entorno
          </p>
          {bootstrapOnly.map((email) => (
            <div key={email} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-amber-800 font-medium">{email}</span>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                env var
              </span>
            </div>
          ))}
        </div>
      )}

      {/* DB users */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">
            Autorizados en base de datos
          </p>
        </div>

        {users.length === 0 ? (
          <p className="p-4 text-sm text-[#4A5568] text-center">
            Ninguno aún. Agregá una cuenta de Google abajo.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#0F1A2E]">{u.email}</p>
                  {u.addedBy && (
                    <p className="text-xs text-[#4A5568]">
                      Agregado por {u.addedBy} · {new Date(u.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {u.email === currentEmail && (
                    <span className="text-xs bg-[#C9A84C]/10 text-[#8B6914] px-2 py-0.5 rounded-full">
                      Vos
                    </span>
                  )}
                  <button
                    onClick={() => removeUser(u.id, u.email)}
                    disabled={u.email === currentEmail}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add user */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-3">
          Agregar cuenta de Google
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nuevo@gmail.com"
            onKeyDown={(e) => e.key === "Enter" && addUser()}
            className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
          />
          <button
            onClick={addUser}
            disabled={adding || !newEmail.trim()}
            className="bg-[#C9A84C] text-[#0F1A2E] font-semibold px-4 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
          >
            {adding ? "Agregando..." : "Agregar"}
          </button>
        </div>
        {error && <p className="mt-2 text-red-500 text-xs">{error}</p>}
        <p className="mt-2 text-xs text-[#4A5568]">
          El email tiene que ser una cuenta de Google (@gmail.com o Google Workspace).
        </p>
      </div>
    </div>
  );
}
