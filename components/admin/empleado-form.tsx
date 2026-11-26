"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIAS = [
  "Conductor 1ra Categoría",
  "Conductor 2da Categoría",
  "Conductor 3ra Categoría",
  "Ayudante",
];

type EmpleadoValues = {
  nombre: string;
  apellido: string;
  cuit: string;
  categoria: string;
  fechaIngreso: string;
  activo: boolean;
};

type Props = {
  empleadoId?: string;
  initial?: Partial<EmpleadoValues>;
};

const EMPTY: EmpleadoValues = {
  nombre: "",
  apellido: "",
  cuit: "",
  categoria: "",
  fechaIngreso: "",
  activo: true,
};

export default function EmpleadoForm({ empleadoId, initial }: Props) {
  const router = useRouter();
  const isEdit = !!empleadoId;
  const [v, setV] = useState<EmpleadoValues>({ ...EMPTY, ...initial });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof EmpleadoValues, val: string | boolean) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = {
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim() || null,
      cuit: v.cuit.trim() || null,
      categoria: v.categoria.trim() || null,
      fechaIngreso: v.fechaIngreso || null,
      activo: v.activo,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/empleados/${empleadoId}` : "/api/empleados",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Error al guardar");
      }
      router.push("/admin/empleados");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {/* Datos personales */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#0F1A2E] mb-4">Datos personales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Nombre *</label>
            <input
              type="text"
              value={v.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="José"
              required
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Apellido</label>
            <input
              type="text"
              value={v.apellido}
              onChange={(e) => set("apellido", e.target.value)}
              placeholder="Torres"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">CUIL</label>
            <input
              type="text"
              value={v.cuit}
              onChange={(e) => set("cuit", e.target.value)}
              placeholder="20-12345678-9"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
        </div>
      </div>

      {/* Datos laborales */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#0F1A2E] mb-4">Datos laborales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Fecha de ingreso</label>
            <input
              type="date"
              value={v.fechaIngreso}
              onChange={(e) => set("fechaIngreso", e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Categoría</label>
            <input
              type="text"
              list="categorias-list"
              value={v.categoria}
              onChange={(e) => set("categoria", e.target.value)}
              placeholder="Seleccioná o escribí"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
            <datalist id="categorias-list">
              {CATEGORIAS.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <input
              id="activo"
              type="checkbox"
              checked={v.activo}
              onChange={(e) => set("activo", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#C9A84C] focus:ring-[#C9A84C]"
            />
            <label htmlFor="activo" className="text-sm text-[#0F1A2E]">Empleado activo</label>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !v.nombre.trim()}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear empleado"}
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
