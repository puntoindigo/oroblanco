import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VehiculoForm from "@/components/admin/vehiculo-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditarVehiculoPage({ params }: Props) {
  const { id } = await params;
  const vehiculo = await prisma.vehiculo.findUnique({ where: { id } });
  if (!vehiculo) notFound();

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Editar vehículo</h1>
        <p className="text-[#4A5568] text-sm mt-1 font-mono">{vehiculo.patente} · {vehiculo.marca} {vehiculo.modelo}</p>
      </div>
      <VehiculoForm vehiculo={vehiculo} />
    </div>
  );
}
