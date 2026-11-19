"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteClienteButton({ id, viajeCount }: { id: string; viajeCount: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (viajeCount > 0) return null;

  async function doDelete() {
    setLoading(true);
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/clientes");
      router.refresh();
    } else {
      setLoading(false);
      setConfirm(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Eliminar cliente
      </button>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-xs w-full text-center">
            <p className="font-bold text-[#0F1A2E] mb-2">¿Eliminar cliente?</p>
            <p className="text-sm text-[#4A5568] mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)} className="flex-1 border border-gray-200 py-2 rounded text-sm">
                Cancelar
              </button>
              <button
                onClick={doDelete}
                disabled={loading}
                className="flex-1 bg-red-500 text-white py-2 rounded text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
