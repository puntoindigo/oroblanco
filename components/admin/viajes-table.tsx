"use client";

import { type Viaje, type EstadoViaje } from "@prisma/client";
import Link from "next/link";

const ESTADO_LABELS: Record<EstadoViaje, string> = {
  PROGRAMADO: "Programado",
  EN_CURSO: "En curso",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLORS: Record<EstadoViaje, string> = {
  PROGRAMADO: "bg-blue-100 text-blue-800",
  EN_CURSO: "bg-yellow-100 text-yellow-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-gray-100 text-gray-600",
};

export default function ViajesTable({ viajes }: { viajes: Viaje[] }) {
  async function deleteViaje(id: string) {
    if (!confirm("¿Eliminar este viaje?")) return;
    await fetch(`/api/viajes/${id}`, { method: "DELETE" });
    window.location.reload();
  }

  if (viajes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
        <div className="text-4xl mb-3">🚛</div>
        <p className="text-[#4A5568] text-sm mb-4">No hay viajes registrados</p>
        <Link
          href="/admin/viajes/nuevo"
          className="inline-block bg-[#C9A84C] text-[#0F1A2E] font-semibold px-5 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
        >
          Registrar primer viaje
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F8F8F4]">
              {["Fecha", "Cliente", "Ruta", "Tipo", "Precio", "Estado", ""].map((h) => (
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
            {viajes.map((v) => (
              <tr
                key={v.id}
                className="border-b border-gray-50 hover:bg-[#F8F8F4] transition-colors"
              >
                <td className="px-4 py-3 text-xs text-[#4A5568] whitespace-nowrap">
                  {new Date(v.fecha).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[#0F1A2E]">{v.cliente}</div>
                  {v.clienteTel && (
                    <div className="text-xs text-[#4A5568]">{v.clienteTel}</div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  <span className="text-[#1E3A5F] font-medium">{v.origen}</span>
                  <span className="text-[#4A5568] mx-1">→</span>
                  <span className="text-[#1E3A5F] font-medium">{v.destino}</span>
                </td>
                <td className="px-4 py-3 text-xs text-[#4A5568]">{v.tipoCarga}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#0F1A2E] whitespace-nowrap">
                  ${v.precio.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ESTADO_COLORS[v.estado]
                    }`}
                  >
                    {ESTADO_LABELS[v.estado]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/viajes/${v.id}`}
                      className="text-xs text-[#1E3A5F] hover:text-[#C9A84C] transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteViaje(v.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
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
  );
}
