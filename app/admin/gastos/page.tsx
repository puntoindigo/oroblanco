"use client";

import { useState, useEffect } from "react";
import { TIPOS_GASTO } from "@/lib/constants";

type Gasto = {
  id: string; fecha: string; descripcion: string; monto: number; tipo: string;
  nroComprobante: string | null;
  vehiculo: { patente: string } | null;
  viaje: { origen: string; destino: string; cliente: string } | null;
};

type Vehiculo = { id: string; patente: string; marca: string; modelo: string };

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "", monto: "", tipo: "OTRO",
    nroComprobante: "", vehiculoId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/gastos").then((r) => r.json()),
      fetch("/api/vehiculos").then((r) => r.json()),
    ]).then(([g, v]) => { setGastos(g); setVehiculos(v); }).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGastos((prev) => [data, ...prev]);
      setForm({ fecha: new Date().toISOString().split("T")[0], descripcion: "", monto: "", tipo: "OTRO", nroComprobante: "", vehiculoId: "" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setAdding(false);
    }
  }

  async function deleteGasto(id: string) {
    if (!confirm("¿Eliminar este gasto?")) return;
    await fetch(`/api/gastos/${id}`, { method: "DELETE" });
    setGastos((prev) => prev.filter((g) => g.id !== id));
  }

  const totalMes = gastos
    .filter((g) => new Date(g.fecha).getMonth() === new Date().getMonth())
    .reduce((s, g) => s + g.monto, 0);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Gastos</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {gastos.length} registros · Este mes:{" "}
            <span className="font-semibold text-[#1E3A5F]">${totalMes.toLocaleString("es-AR")}</span>
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider mb-3">Registrar gasto</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required className={iCls} />
          <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required placeholder="Descripción" className={iCls} />
          <input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })}
            required placeholder="Monto (ARS)" className={iCls} />
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className={iCls}>
            {Object.entries(TIPOS_GASTO).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input value={form.nroComprobante} onChange={(e) => setForm({ ...form, nroComprobante: e.target.value })}
            placeholder="Nro. comprobante (opcional)" className={iCls} />
          <select value={form.vehiculoId} onChange={(e) => setForm({ ...form, vehiculoId: e.target.value })} className={iCls}>
            <option value="">— Sin vehículo —</option>
            {vehiculos.map((v) => <option key={v.id} value={v.id}>{v.patente} · {v.marca} {v.modelo}</option>)}
          </select>
        </div>
        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        <button type="submit" disabled={adding}
          className="mt-3 bg-[#C9A84C] text-[#0F1A2E] font-bold px-5 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60">
          {adding ? "Guardando..." : "Registrar"}
        </button>
      </form>

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-[#4A5568]">Cargando...</p>
      ) : gastos.length === 0 ? (
        <p className="text-sm text-[#4A5568]">Sin gastos registrados.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                  {["Fecha", "Descripción", "Tipo", "Monto", "Vehículo", "Comprobante", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-[#F8F8F4]">
                    <td className="px-4 py-3 text-xs text-[#4A5568] whitespace-nowrap">
                      {new Date(g.fecha).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-[#0F1A2E]">{g.descripcion}</td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">{TIPOS_GASTO[g.tipo] ?? g.tipo}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F1A2E] whitespace-nowrap">
                      ${g.monto.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568] font-mono">{g.vehiculo?.patente ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">{g.nroComprobante ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteGasto(g.id)} className="text-xs text-red-400 hover:text-red-600">Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const iCls = "border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400 w-full";
