"use client";

import { useState, useEffect } from "react";
import { TIPOS_VEHICULO } from "@/lib/constants";

type Vehiculo = {
  id: string; patente: string; marca: string; modelo: string;
  anio: number | null; tipo: string; activo: boolean;
  motor?: string | null; chasis?: string | null; vtoSeguro?: string | null;
};

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ patente: "", marca: "", modelo: "", anio: "", tipo: "Camión" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/vehiculos").then((r) => r.json()).then(setVehiculos).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/vehiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVehiculos((prev) => [data, ...prev]);
      setForm({ patente: "", marca: "", modelo: "", anio: "", tipo: "Camión" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setAdding(false);
    }
  }

  async function toggleActivo(v: Vehiculo) {
    await fetch(`/api/vehiculos/${v.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !v.activo }),
    });
    setVehiculos((prev) => prev.map((x) => x.id === v.id ? { ...x, activo: !v.activo } : x));
  }

  async function deleteVehiculo(id: string) {
    if (!confirm("¿Eliminar vehículo? Solo es posible si no tiene viajes o gastos asociados.")) return;
    const res = await fetch(`/api/vehiculos/${id}`, { method: "DELETE" });
    if (res.ok) setVehiculos((prev) => prev.filter((v) => v.id !== id));
    else alert("No se puede eliminar: tiene registros asociados.");
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Vehículos</h1>
        <p className="text-[#4A5568] text-sm mt-1">Flota disponible para asignar a viajes</p>
      </div>

      {/* Formulario alta */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-3">Agregar vehículo</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <input value={form.patente} onChange={(e) => setForm({ ...form, patente: e.target.value.toUpperCase() })}
            required placeholder="Patente" className={iCls} />
          <input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })}
            required placeholder="Marca" className={iCls} />
          <input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            required placeholder="Modelo" className={iCls} />
          <input value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })}
            type="number" placeholder="Año" min={1980} max={2030} className={iCls} />
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={iCls}>
            {TIPOS_VEHICULO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <button type="submit" disabled={adding}
          className="mt-3 bg-[#C9A84C] text-[#0F1A2E] font-bold px-5 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60">
          {adding ? "Guardando..." : "Agregar"}
        </button>
      </form>

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-[#4A5568]">Cargando...</p>
      ) : vehiculos.length === 0 ? (
        <p className="text-sm text-[#4A5568]">Sin vehículos registrados.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                {["Patente", "Marca / Modelo", "Año", "Tipo", "Estado", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id} className="border-b border-gray-50 hover:bg-[#F8F8F4]">
                  <td className="px-4 py-3 font-mono font-semibold text-[#0F1A2E]">{v.patente}</td>
                  <td className="px-4 py-3 text-[#0F1A2E]">
                    {v.marca} {v.modelo}
                    {(v.motor || v.chasis) && (
                      <span className="block text-[10px] text-[#4A5568]">
                        {v.motor && `Motor: ${v.motor}`}{v.motor && v.chasis && " · "}{v.chasis && `Chasis: ${v.chasis}`}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{v.anio ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">
                    {v.tipo}
                    {v.vtoSeguro && (
                      <span className="block text-[10px] text-amber-600">
                        Seguro vto: {new Date(v.vtoSeguro).toLocaleDateString("es-AR")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActivo(v)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {v.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteVehiculo(v.id)} className="text-xs text-red-400 hover:text-red-600">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const iCls = "border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400 w-full";
