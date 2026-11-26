import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReciboForm from "@/components/admin/recibo-form";

export const dynamic = "force-dynamic";

export default async function NuevoReciboPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await prisma.empleado.findUnique({ where: { id } });
  if (!emp) notFound();

  const nombre = emp.apellido ? `${emp.apellido}, ${emp.nombre}` : emp.nombre;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href={`/admin/empleados/${id}`} className="text-[#4A5568] hover:text-[#0F1A2E] text-sm">
          ← {nombre}
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Nuevo Recibo de Sueldo</h1>
        <p className="text-[#4A5568] text-sm mt-1">{nombre}</p>
      </div>

      <ReciboForm empleadoId={id} />
    </div>
  );
}
