"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ESTADO_VIAJE_LABELS, ESTADO_VIAJE_COLORS } from "@/lib/constants";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

type Vehiculo = { patente: string; marca: string; modelo: string } | null;
type Viaje = {
  id: string;
  estado: string;
  fecha: Date | null;
  origen: string;
  destino: string;
  tipoCarga: string;
  cliente: string;
  clienteTel: string | null;
  precio: number | null;
  vehiculo: Vehiculo;
};

const ESTADOS_FILTER = [
  { value: "", label: "Todos" },
  { value: "PRESUPUESTO", label: "Presupuesto" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "FACTURADO", label: "Facturado" },
  { value: "COBRADO", label: "Cobrado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const PERIODOS = [
  { value: "mes", label: "Este mes" },
  { value: "3m", label: "Últimos 3 meses" },
  { value: "todo", label: "Todo" },
];

function inicioMes(mesesAtras = 0) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - mesesAtras, 1);
}

export default function ViajesTable({ viajes }: { viajes: Viaje[] }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState("");
  const [periodo, setPeriodo] = useState("mes");
  const [changingId, setChangingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const desde = periodo === "mes" ? inicioMes(0) : periodo === "3m" ? inicioMes(2) : null;

  const filtered = viajes
    .filter((v) => !filtro || v.estado === filtro)
    .filter((v) => !desde || (v.fecha && new Date(v.fecha) >= desde));

  const listItems = useMemo(
    () => filtered.map((v) => ({ id: v.id, href: `/admin/viajes/${v.id}` })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered.map((v) => v.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/viajes/nuevo");
  const { activeId } = useAdminKeyboardContext();

  async function changeEstado(id: string, estado: string) {
    setChangingId(id);
    await fetch(`/api/viajes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    router.refresh();
    setChangingId(null);
  }

  async function duplicarViaje(id: string) {
    setDuplicatingId(id);
    const res = await fetch(`/api/viajes/${id}/duplicate`, { method: "POST" });
    if (res.ok) {
      const nuevo = await res.json();
      router.push(`/admin/viajes/${nuevo.id}`);
    } else {
      alert("Error al duplicar el viaje.");
      setDuplicatingId(null);
    }
  }

  async function deleteViaje(id: string) {
    if (!confirm("¿Eliminar este viaje?")) return;
    await fetch(`/api/viajes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Filtros de período */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-[#4A5568] font-medium mr-1">Período:</span>
        {PERIODOS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              periodo === p.value
                ? "bg-[#1E3A5F] text-white"
                : "bg-white border border-gray-200 text-[#4A5568] hover:bg-gray-50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-1.5">
        {ESTADOS_FILTER.map((e) => (
          <button
            key={e.value}
            onClick={() => setFiltro(e.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filtro === e.value
                ? "bg-[#C9A84C] text-[#0F1A2E]"
                : "bg-white border border-gray-200 text-[#4A5568] hover:bg-gray-50"
            }`}
          >
            {e.label}
            {e.value && (
              <span className="ml-1 text-[10px] opacity-70">
                ({viajes.filter((v) => !desde || (v.fecha && new Date(v.fecha) >= desde)).filter((v) => v.estado === e.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🚛</div>
          <p className="text-[#4A5568] text-sm mb-4">
            {filtro ? `No hay viajes en estado "${ESTADO_VIAJE_LABELS[filtro]}"` : "No hay viajes registrados"}
          </p>
          <Link
            href="/admin/viajes/nuevo"
            className="inline-block bg-[#C9A84C] text-[#0F1A2E] font-semibold px-5 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
          >
            Registrar primer viaje
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                  {["Estado", "Fecha", "Cliente", "Ruta", "Tipo", "Precio", "Vehículo", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-b border-gray-50 transition-colors ${
                      activeId === v.id
                        ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                        : "hover:bg-[#F8F8F4]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <select
                        value={v.estado}
                        disabled={changingId === v.id}
                        onChange={(e) => changeEstado(v.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none ${
                          ESTADO_VIAJE_COLORS[v.estado] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {Object.entries(ESTADO_VIAJE_LABELS).map(([val, lbl]) => (
                          <option key={val} value={val}>{lbl}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568] whitespace-nowrap">
                      {v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F1A2E]">{v.cliente}</div>
                      {v.clienteTel && <div className="text-xs text-[#4A5568]">{v.clienteTel}</div>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs">
                      <span className="text-[#1E3A5F] font-medium">{v.origen}</span>
                      <span className="text-[#4A5568] mx-1">→</span>
                      <span className="text-[#1E3A5F] font-medium">{v.destino}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">{v.tipoCarga}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {v.precio != null ? (
                        <span className="text-sm font-semibold text-[#0F1A2E]">
                          ${v.precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568] font-mono">
                      {v.vehiculo?.patente ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/viajes/${v.id}`} className="text-xs text-[#1E3A5F] hover:text-[#C9A84C] transition-colors">
                          Editar
                        </Link>
                        <button
                          onClick={() => duplicarViaje(v.id)}
                          disabled={duplicatingId === v.id}
                          className="text-xs text-[#4A5568] hover:text-[#1E3A5F] transition-colors disabled:opacity-50"
                          title="Duplicar como Pendiente"
                        >
                          {duplicatingId === v.id ? "..." : "Duplicar"}
                        </button>
                        <button onClick={() => deleteViaje(v.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Borrar
                        </button>
                      </div>
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
