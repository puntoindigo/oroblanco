import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ClientesTable from "@/components/admin/clientes-table";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { viajes: true } },
      viajes: {
        select: { precio: true },
        where: { precio: { not: null } },
      },
    },
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Clientes</h1>
          <p className="text-[#4A5568] text-sm mt-1">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/clientes/nuevo"
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-4 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors"
        >
          + Nuevo cliente
        </Link>
      </div>
      <ClientesTable clientes={clientes} />
    </div>
  );
}
