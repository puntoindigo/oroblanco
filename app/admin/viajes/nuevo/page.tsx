import { prisma } from "@/lib/prisma";
import ViajeForm from "@/components/admin/viaje-form";

export default async function NuevoViajePage() {
  const vehiculos = await prisma.vehiculo.findMany({
    where: { activo: true },
    select: { id: true, patente: true, marca: true, modelo: true },
    orderBy: { patente: "asc" },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Nuevo viaje</h1>
        <p className="text-[#4A5568] text-sm mt-1">Registrá los datos del flete</p>
      </div>
      <ViajeForm vehiculos={vehiculos} />
    </div>
  );
}
