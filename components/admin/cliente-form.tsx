"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClienteData = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  tel: string | null;
  cuit: string | null;
  notas: string | null;
};

export default function ClienteForm({ cliente }: { cliente?: ClienteData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!cliente;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v)])
    );

    const url = isEdit ? `/api/clientes/${cliente!.id}` : "/api/clientes";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/clientes");
      router.refresh();
    } catch {
      setError("Error al guardar. Revisá los datos.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Nombre *</label>
          <input
            name="nombre"
            required
            defaultValue={cliente?.nombre}
            placeholder="Juan García"
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Empresa</label>
          <input
            name="empresa"
            defaultValue={cliente?.empresa ?? ""}
            placeholder="Razón social"
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Teléfono</label>
          <input
            name="tel"
            type="tel"
            defaultValue={cliente?.tel ?? ""}
            placeholder="341 555-0000"
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">CUIT</label>
          <input
            name="cuit"
            defaultValue={cliente?.cuit ?? ""}
            placeholder="20-12345678-9"
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={cliente?.email ?? ""}
            placeholder="contacto@empresa.com"
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Notas</label>
          <textarea
            name="notas"
            rows={3}
            defaultValue={cliente?.notas ?? ""}
            placeholder="Observaciones internas sobre este cliente..."
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] resize-none"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-red-500 text-xs">{error}</p>}

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-200 text-[#4A5568] px-5 py-2.5 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
