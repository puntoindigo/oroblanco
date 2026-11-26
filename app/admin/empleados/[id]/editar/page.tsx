import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EmpleadoForm from "@/components/admin/empleado-form";

export const dynamic = "force-dynamic";

export default async function EditarEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await prisma.empleado.findUnique({ where: { id } });
  if (!emp) notFound();

  const initial = {
    nombre: emp.nombre,
    apellido: emp.apellido ?? "",
    cuit: emp.cuit ?? "",
    categoria: emp.categoria ?? "",
    fechaIngreso: emp.fechaIngreso
      ? emp.fechaIngreso.toISOString().split("T")[0]
      : "",
    activo: emp.activo,
  };

  const nombre = emp.apellido ? `${emp.apellido}, ${emp.nombre}` : emp.nombre;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <Link href="/admin/empleados" className="text-[#4A5568] hover:text-[#0F1A2E] text-sm">
          ← Empleados
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#0F1A2E] mb-1">Editar datos de empleado</h1>
      <p className="text-[#4A5568] text-sm mb-6">{nombre}</p>
      <EmpleadoForm empleadoId={id} initial={initial} />
    </div>
  );
}
