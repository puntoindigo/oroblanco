"use client";

import { useMemo } from "react";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

type Empleado = {
  id: string;
  legajo: string | null;
  nombre: string;
  apellido: string | null;
  cuit: string | null;
  cct: string | null;
  categoria: string | null;
  fechaIngreso: string | null;
  activo: boolean;
  _count: { viajes: number; documentos: number };
};

export default function EmpleadosTable({ empleados }: { empleados: Empleado[] }) {
  const listItems = useMemo(
    () => empleados.map((e) => ({ id: e.id, href: "/admin/empleados" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [empleados.map((e) => e.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/empleados");
  const { activeId } = useAdminKeyboardContext();

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Legajo</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden sm:table-cell">CCT / Cat.</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Ingreso</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Viajes</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {empleados.map((emp) => (
              <tr
                key={emp.id}
                className={`transition-colors ${
                  activeId === emp.id
                    ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-mono text-[#1E3A5F] font-semibold">
                  {emp.legajo ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-[#0F1A2E]">
                    {emp.apellido ? `${emp.apellido}, ${emp.nombre}` : emp.nombre}
                  </span>
                  {emp.cuit && (
                    <span className="block text-xs text-[#4A5568]">CUIT {emp.cuit}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-[#4A5568]">
                  {emp.cct && <span className="block">{emp.cct}</span>}
                  {emp.categoria && <span className="block text-xs">{emp.categoria}</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                  {emp.fechaIngreso
                    ? new Date(emp.fechaIngreso).toLocaleDateString("es-AR")
                    : "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                  {emp._count.viajes}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      emp.activo
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {emp.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4A5568]">
                  No hay empleados registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {empleados.length > 0 && (
        <p className="text-xs text-[#4A5568] mt-3">
          Docs por empleado:{" "}
          {empleados.map((e) => `${e.apellido ?? e.nombre}: ${e._count.documentos}`).join(" · ")}
        </p>
      )}
    </>
  );
}
