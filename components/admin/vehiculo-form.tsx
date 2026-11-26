"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIPOS_VEHICULO } from "@/lib/constants";

type VehiculoFormData = {
  id?: string;
  patente?: string;
  marca?: string;
  modelo?: string;
  anio?: number | null;
  tipo?: string;
  motor?: string | null;
  chasis?: string | null;
  ciaSeguro?: string | null;
  activo?: boolean;
};

export default function VehiculoForm({ vehiculo }: { vehiculo?: VehiculoFormData }) {
  const router = useRouter();
  const isEdit = !!vehiculo?.id;

  const [form, setForm] = useState({
    patente: vehiculo?.patente ?? "",
    marca: vehiculo?.marca ?? "",
    modelo: vehiculo?.modelo ?? "",
    anio: vehiculo?.anio?.toString() ?? "",
    tipo: vehiculo?.tipo ?? "Camión",
    motor: vehiculo?.motor ?? "",
    chasis: vehiculo?.chasis ?? "",
    ciaSeguro: vehiculo?.ciaSeguro ?? "",
    activo: vehiculo?.activo ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/vehiculos/${vehiculo!.id}` : "/api/vehiculos";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al guardar");
      router.push("/admin/vehiculos");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-4">Datos del vehículo</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Patente *</label>
            <input
              value={form.patente}
              onChange={(e) => setForm({ ...form, patente: e.target.value.toUpperCase() })}
              required placeholder="ABC123"
              className={iCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={iCls}>
              {TIPOS_VEHICULO.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Marca *</label>
            <input
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
              required placeholder="Mercedes-Benz"
              className={iCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Modelo *</label>
            <input
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              required placeholder="Atego 1726"
              className={iCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Año</label>
            <input
              value={form.anio}
              onChange={(e) => setForm({ ...form, anio: e.target.value })}
              type="number" placeholder="2020" min={1980} max={2030}
              className={iCls}
            />
          </div>
          {isEdit && (
            <div className="flex items-center gap-3 pt-4">
              <input
                id="activo"
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                className="accent-[#C9A84C] w-4 h-4"
              />
              <label htmlFor="activo" className="text-sm text-[#0F1A2E]">Vehículo activo</label>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-4">Seguro y datos técnicos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Compañía de seguro</label>
            <input
              value={form.ciaSeguro}
              onChange={(e) => setForm({ ...form, ciaSeguro: e.target.value })}
              placeholder="Federación Patronal"
              className={iCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Nro. motor</label>
            <input
              value={form.motor}
              onChange={(e) => setForm({ ...form, motor: e.target.value })}
              placeholder="Motor..."
              className={iCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#4A5568] mb-1">Nro. chasis</label>
            <input
              value={form.chasis}
              onChange={(e) => setForm({ ...form, chasis: e.target.value })}
              placeholder="Chasis..."
              className={iCls}
            />
          </div>
        </div>
      </section>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit" disabled={saving}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar vehículo"}
        </button>
        <button
          type="button" onClick={() => router.back()}
          className="border border-gray-200 text-[#4A5568] px-6 py-2.5 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

const iCls = "border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400 w-full";
