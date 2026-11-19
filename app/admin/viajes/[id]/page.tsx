import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ViajeForm from "@/components/admin/viaje-form";

export default async function EditarViajePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [viaje, vehiculos, facturasVinculadas, facturasDisponibles] = await Promise.all([
    prisma.viaje.findUnique({ where: { id }, include: { clienteRel: { select: { nombre: true, empresa: true } } } }),
    prisma.vehiculo.findMany({
      where: { activo: true },
      select: { id: true, patente: true, marca: true, modelo: true },
      orderBy: { patente: "asc" },
    }),
    prisma.factura.findMany({
      where: { viajeId: id },
      select: { id: true, tipo: true, puntoVenta: true, numero: true, total: true, viajeId: true },
      orderBy: { fecha: "asc" },
    }),
    prisma.factura.findMany({
      where: { viajeId: null },
      select: { id: true, tipo: true, puntoVenta: true, numero: true, total: true, viajeId: true },
      orderBy: { fecha: "desc" },
      take: 200,
    }),
  ]);
  if (!viaje) notFound();

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Editar viaje</h1>
        <p className="text-[#4A5568] text-sm mt-1">
          {viaje.origen} → {viaje.destino} · {viaje.cliente}
        </p>
      </div>
      <ViajeForm viaje={viaje} vehiculos={vehiculos} facturasVinculadas={facturasVinculadas} facturasDisponibles={facturasDisponibles} />
    </div>
  );
}
