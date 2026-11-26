"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

type Vehiculo = {
  id: string; patente: string; marca: string; modelo: string;
  anio: number | null; tipo: string; activo: boolean;
  motor?: string | null; chasis?: string | null; ciaSeguro?: string | null;
};

export default function VehiculosClient({ vehiculos: initial }: { vehiculos: Vehiculo[] }) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initial);

  const listItems = useMemo(
    () => vehiculos.map((v) => ({ id: v.id, href: `/admin/vehiculos/${v.id}/editar` })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vehiculos.map((v) => v.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/vehiculos");
  const { activeId } = useAdminKeyboardContext();

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Vehículos</h1>
          <p className="text-[#4A5568] text-sm mt-1">Flota disponible para asignar a viajes</p>
        </div>
        <Link
          href="/admin/vehiculos/nuevo"
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-4 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
        >
          + Nuevo vehículo
        </Link>
      </div>

      {vehiculos.length === 0 ? (
        <p className="text-sm text-[#4A5568]">Sin vehículos registrados.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                {["Patente", "Marca / Modelo", "Año", "Tipo", "Seguro", "Estado", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehiculos.map((v) => (
                <tr key={v.id} className={`border-b border-gray-50 transition-colors ${
                  activeId === v.id
                    ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                    : "hover:bg-[#F8F8F4]"
                }`}>
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
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{v.tipo}</td>
                  <td className="px-4 py-3 text-xs text-[#4A5568]">{v.ciaSeguro ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActivo(v)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {v.activo ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Link href={`/admin/vehiculos/${v.id}/editar`} className="text-xs text-[#1E3A5F] hover:underline">
                      Editar
                    </Link>
                    <button onClick={() => deleteVehiculo(v.id)} className="text-xs text-red-400 hover:text-red-600">
                      Borrar
                    </button>
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
