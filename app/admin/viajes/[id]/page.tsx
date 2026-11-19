import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ViajeForm from "@/components/admin/viaje-form";

export default async function EditarViajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viaje = await prisma.viaje.findUnique({ where: { id } });
  if (!viaje) notFound();

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Editar viaje</h1>
        <p className="text-[#4A5568] text-sm mt-1">
          {viaje.origen} → {viaje.destino} · {viaje.cliente}
        </p>
      </div>
      <ViajeForm viaje={viaje} />
    </div>
  );
}
