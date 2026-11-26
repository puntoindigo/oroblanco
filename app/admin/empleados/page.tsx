import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EmpleadosTable from "@/components/admin/empleados-table";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const rawEmpleados = await prisma.empleado.findMany({
    include: {
      _count: { select: { viajes: true, documentos: true } },
    },
    orderBy: { apellido: "asc" },
  });

  const empleados = rawEmpleados.map((e) => ({
    ...e,
    fechaIngreso: e.fechaIngreso ? e.fechaIngreso.toISOString() : null,
  }));

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Empleados</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {empleados.filter((e) => e.activo).length} activos · {empleados.length} total
          </p>
        </div>
        <Link
          href="/admin/empleados/nuevo"
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-4 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
        >
          + Nuevo empleado
        </Link>
      </div>
      <EmpleadosTable empleados={empleados} />
    </div>
  );
}
