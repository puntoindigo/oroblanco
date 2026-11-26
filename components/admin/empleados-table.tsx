"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

function empSlug(emp: { id: string; cuit: string | null; apellido: string | null; nombre: string }): string {
  if (emp.cuit?.trim()) return emp.cuit.replace(/\D/g, "");
  const parts = [emp.apellido, emp.nombre].filter(Boolean).join(" ");
  if (parts) {
    return parts
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  return emp.id;
}

type Empleado = {
  id: string;
  legajo: string | null;
  nombre: string;
  apellido: string | null;
  cuit: string | null;
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
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden sm:table-cell">Categoría</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Ingreso</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Estado</th>
              <th className="px-4 py-3" />
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
                <td className="px-4 py-3">
                  <span className="font-semibold text-[#0F1A2E]">
                    {emp.apellido ? `${emp.apellido}, ${emp.nombre}` : emp.nombre}
                  </span>
                  {emp.cuit && (
                    <span className="block text-xs text-[#4A5568]">CUIL {emp.cuit}</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-[#4A5568]">
                  {emp.categoria ?? "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                  {emp.fechaIngreso
                    ? new Date(emp.fechaIngreso).toLocaleDateString("es-AR", { timeZone: "UTC" })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    emp.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                  }`}>
                    {emp.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/empleados/${empSlug(emp)}/editar`}
                    className="text-xs text-[#1E3A5F] hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {empleados.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#4A5568]">
                  No hay empleados registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
