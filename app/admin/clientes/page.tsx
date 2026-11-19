import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

      {clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-[#4A5568]">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-medium">Sin clientes todavía</p>
          <p className="text-sm mt-1">Los clientes se crean desde el formulario de un viaje, o manualmente.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F8F8F4] border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Viajes</th>
                <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden md:table-cell">Facturado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clientes.map((c) => {
                const total = c.viajes.reduce((s, v) => s + (v.precio ?? 0), 0);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clientes/${c.id}`} className="font-medium text-[#0F1A2E] hover:text-[#1E3A5F]">
                        {c.nombre}
                      </Link>
                      {c.empresa && <p className="text-xs text-[#4A5568]">{c.empresa}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] hidden sm:table-cell">{c.tel ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-[#0F1A2E]">{c._count.viajes}</td>
                    <td className="px-4 py-3 text-right text-[#4A5568] hidden md:table-cell">
                      {total > 0
                        ? `$${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clientes/${c.id}`}
                        className="text-xs text-[#1E3A5F] hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
