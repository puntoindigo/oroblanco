import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const empleados = await prisma.empleado.findMany({
    include: {
      _count: { select: { viajes: true, documentos: true } },
    },
    orderBy: { apellido: "asc" },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Empleados</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {empleados.filter((e) => e.activo).length} activos · {empleados.length} total
          </p>
        </div>
      </div>

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
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
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
    </div>
  );
}
