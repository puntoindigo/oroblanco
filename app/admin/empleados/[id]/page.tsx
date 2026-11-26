import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ConfigEmpleadoForm from "@/components/admin/config-empleado-form";
import type { CctRates } from "@/lib/calcular-recibo";

export const dynamic = "force-dynamic";

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default async function EmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await prisma.empleado.findUnique({
    where: { id },
    include: {
      recibos: { orderBy: [{ periodoAnio: "desc" }, { periodoMes: "desc" }] },
    },
  });
  if (!emp) notFound();

  const antigüedad = emp.fechaIngreso
    ? Math.floor((Date.now() - new Date(emp.fechaIngreso).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/empleados" className="text-[#4A5568] hover:text-[#0F1A2E] text-sm">
          ← Empleados
        </Link>
      </div>

      {/* Header empleado */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1A2E]">
              {emp.apellido ? `${emp.apellido}, ${emp.nombre}` : emp.nombre}
            </h1>
            {emp.legajo && (
              <p className="text-[#4A5568] text-sm mt-0.5">Legajo #{emp.legajo}</p>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${emp.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
            {emp.activo ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-[#4A5568] uppercase tracking-wider">CUIT</p>
            <p className="font-medium text-[#0F1A2E]">{emp.cuit ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A5568] uppercase tracking-wider">CCT</p>
            <p className="font-medium text-[#0F1A2E]">{emp.cct ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A5568] uppercase tracking-wider">Categoría</p>
            <p className="font-medium text-[#0F1A2E]">{emp.categoria ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A5568] uppercase tracking-wider">Ingreso · Antigüedad</p>
            <p className="font-medium text-[#0F1A2E]">
              {emp.fechaIngreso ? new Date(emp.fechaIngreso).toLocaleDateString("es-AR") : "—"}
              {antigüedad !== null && <span className="text-[#4A5568] ml-1">({antigüedad} {antigüedad === 1 ? "año" : "años"})</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Config CCT */}
      <div id="config">
        <ConfigEmpleadoForm
          empleadoId={id}
          initial={{
            remuneracionAsignada: emp.remuneracionAsignada ?? null,
            seccion: emp.seccion ?? "",
            modalidad: emp.modalidad ?? "",
            obraSocialNombre: emp.obraSocialNombre ?? "",
            lugaryFecha: emp.lugaryFecha ?? "",
            cctRates: (emp.cctRates as CctRates | null),
          }}
        />
      </div>

      {/* Recibos */}
      <div className="flex justify-between items-center mb-3 mt-6">
        <h2 className="text-lg font-bold text-[#0F1A2E]">Recibos de Sueldo</h2>
        <Link
          href={`/admin/empleados/${id}/recibos/nuevo`}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-4 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
        >
          + Nuevo recibo
        </Link>
      </div>

      {emp.recibos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-[#4A5568]">
          <p className="text-3xl mb-2">📄</p>
          <p className="font-medium">Sin recibos cargados</p>
          <p className="text-sm mt-1">Generá el primero con el botón de arriba.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F8F4] border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Período</th>
                <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Sueldo Neto</th>
                <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Bruto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {emp.recibos.map((r) => {
                const d = r.data as Record<string, unknown>;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#0F1A2E]">
                      {MESES[r.periodoMes]} {r.periodoAnio}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#0F1A2E]">
                      {typeof d.sueldoNeto === "number"
                        ? `$${(d.sueldoNeto as number).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-[#4A5568] hidden sm:table-cell">
                      {typeof d.sueldoBruto === "number"
                        ? `$${(d.sueldoBruto as number).toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/api/empleados/${id}/recibos/${r.id}/pdf`}
                        className="inline-flex items-center gap-1 bg-[#0F1A2E] text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-[#1E3A5F] transition-colors"
                      >
                        ↓ PDF
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
