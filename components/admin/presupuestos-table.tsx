"use client";

import { useState } from "react";
import { type Presupuesto, type EstadoPresupuesto } from "@prisma/client";

const ESTADO_LABELS: Record<EstadoPresupuesto, string> = {
  NUEVO: "Nuevo",
  VISTO: "Visto",
  EN_PROCESO: "En proceso",
  CERRADO: "Cerrado",
};

const ESTADO_COLORS: Record<EstadoPresupuesto, string> = {
  NUEVO: "bg-[#C9A84C] text-[#0F1A2E]",
  VISTO: "bg-blue-100 text-blue-800",
  EN_PROCESO: "bg-green-100 text-green-800",
  CERRADO: "bg-gray-100 text-gray-600",
};

export default function PresupuestosTable({
  presupuestos,
}: {
  presupuestos: Presupuesto[];
}) {
  const [filter, setFilter] = useState<EstadoPresupuesto | "TODOS">("TODOS");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered =
    filter === "TODOS" ? presupuestos : presupuestos.filter((p) => p.estado === filter);

  async function updateEstado(id: string, estado: EstadoPresupuesto) {
    setUpdating(id);
    await fetch(`/api/presupuesto/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setUpdating(null);
    window.location.reload();
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["TODOS", "NUEVO", "VISTO", "EN_PROCESO", "CERRADO"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === s
                ? "bg-[#1E3A5F] text-white"
                : "bg-white border border-gray-200 text-[#4A5568] hover:bg-gray-50"
            }`}
          >
            {s === "TODOS" ? "Todos" : ESTADO_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-[#4A5568] text-sm">
            No hay presupuestos con este estado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                  {["Fecha", "Nombre", "Ruta", "Tipo carga", "Estado", "Acciones"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-50 hover:bg-[#F8F8F4] transition-colors ${
                      i % 2 === 0 ? "" : "bg-gray-50/30"
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-[#4A5568] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0F1A2E]">{p.nombre}</div>
                      {p.empresa && (
                        <div className="text-xs text-[#4A5568]">{p.empresa}</div>
                      )}
                      <div className="text-xs text-[#4A5568]">{p.telefono}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[#1E3A5F] font-medium">{p.origen}</span>
                      <span className="text-[#4A5568] mx-1">→</span>
                      <span className="text-[#1E3A5F] font-medium">{p.destino}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4A5568]">{p.tipoCarga}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          ESTADO_COLORS[p.estado]
                        }`}
                      >
                        {ESTADO_LABELS[p.estado]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        disabled={updating === p.id}
                        defaultValue={p.estado}
                        onChange={(e) =>
                          updateEstado(p.id, e.target.value as EstadoPresupuesto)
                        }
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-[#0F1A2E] focus:outline-none focus:border-[#C9A84C]"
                      >
                        {(
                          ["NUEVO", "VISTO", "EN_PROCESO", "CERRADO"] as EstadoPresupuesto[]
                        ).map((s) => (
                          <option key={s} value={s}>
                            {ESTADO_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
