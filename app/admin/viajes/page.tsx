import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ViajesTable from "@/components/admin/viajes-table";

export const dynamic = "force-dynamic";

export default async function ViajesPage() {
  const viajes = await prisma.viaje.findMany({
    orderBy: { fecha: "desc" },
  });

  const totalFact = viajes.reduce((sum, v) => sum + v.precio, 0);

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Viajes</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {viajes.length} viajes registrados · Total facturado:{" "}
            <span className="font-semibold text-[#1E3A5F]">
              ${totalFact.toLocaleString("es-AR")}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/api/viajes/export"
            className="text-xs border border-gray-200 bg-white text-[#4A5568] px-3 py-2 rounded hover:bg-gray-50 transition-colors"
          >
            Exportar CSV
          </Link>
          <Link
            href="/admin/viajes/nuevo"
            className="text-xs bg-[#C9A84C] text-[#0F1A2E] font-semibold px-4 py-2 rounded hover:bg-[#E8C96A] transition-colors"
          >
            + Nuevo viaje
          </Link>
        </div>
      </div>
      <ViajesTable viajes={viajes} />
    </div>
  );
}
