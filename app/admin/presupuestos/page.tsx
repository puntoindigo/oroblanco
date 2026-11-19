import { prisma } from "@/lib/prisma";
import PresupuestosTable from "@/components/admin/presupuestos-table";

export const dynamic = "force-dynamic";

export default async function PresupuestosPage() {
  const presupuestos = await prisma.presupuesto.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Presupuestos</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {presupuestos.length} solicitudes recibidas
          </p>
        </div>
      </div>
      <PresupuestosTable presupuestos={presupuestos} />
    </div>
  );
}
