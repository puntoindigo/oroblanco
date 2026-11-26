import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ClienteForm from "@/components/admin/cliente-form";
import DeleteClienteButton from "./DeleteClienteButton";

export const dynamic = "force-dynamic";

const ESTADO_LABEL: Record<string, string> = {
  PRESUPUESTO: "Presupuesto",
  PENDIENTE: "Pendiente",
  EN_CURSO: "En curso",
  FACTURADO: "Facturado",
  COBRADO: "Cobrado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLOR: Record<string, string> = {
  PRESUPUESTO: "bg-gray-100 text-gray-600",
  PENDIENTE: "bg-yellow-50 text-yellow-700",
  EN_CURSO: "bg-blue-50 text-blue-700",
  FACTURADO: "bg-purple-50 text-purple-700",
  COBRADO: "bg-green-50 text-green-700",
  CANCELADO: "bg-red-50 text-red-600",
};

function toArgDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const mon = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${date.getUTCFullYear()}`;
}

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      viajes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          estado: true,
          fecha: true,
          origen: true,
          destino: true,
          precio: true,
          nroRemito: true,
        },
      },
      _count: { select: { viajes: true } },
    },
  });
  if (!cliente) notFound();

  const totalViajes = cliente.viajes.reduce((s, v) => s + (v.precio ?? 0), 0);

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">{cliente.empresa?.trim() || cliente.nombre}</h1>
          {cliente.empresa && <p className="text-[#4A5568] text-sm">{cliente.nombre}</p>}
        </div>
        <DeleteClienteButton id={id} viajeCount={cliente._count.viajes} />
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-[#4A5568] uppercase tracking-wider mb-1">Viajes</p>
          <p className="text-2xl font-bold text-[#0F1A2E]">{cliente._count.viajes}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-[#4A5568] uppercase tracking-wider mb-1">Facturado</p>
          <p className="text-2xl font-bold text-[#0F1A2E]">
            {totalViajes > 0
              ? `$${totalViajes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
              : "—"}
          </p>
        </div>
        {cliente.tel && (
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-[#4A5568] uppercase tracking-wider mb-1">Teléfono</p>
            <a href={`tel:${cliente.tel}`} className="text-lg font-semibold text-[#1E3A5F] hover:underline">
              {cliente.tel}
            </a>
          </div>
        )}
      </div>

      {/* Datos del cliente */}
      <section>
        <h2 className="text-sm font-semibold text-[#4A5568] uppercase tracking-wider mb-4">Datos del cliente</h2>
        <ClienteForm cliente={cliente} />
      </section>

      {/* Historial de viajes */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#4A5568] uppercase tracking-wider">
            Historial de viajes ({cliente._count.viajes})
          </h2>
          <Link
            href={`/admin/viajes/nuevo?clienteId=${id}`}
            className="text-xs text-[#1E3A5F] hover:underline"
          >
            + Nuevo viaje →
          </Link>
        </div>

        {cliente.viajes.length === 0 ? (
          <p className="text-sm text-[#4A5568]">Sin viajes registrados aún.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F4] border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Ruta</th>
                  <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Estado</th>
                  <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cliente.viajes.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[#0F1A2E] font-mono text-xs">{toArgDate(v.fecha)}</td>
                    <td className="px-4 py-3 text-[#4A5568] hidden sm:table-cell text-xs">
                      {v.origen} → {v.destino}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_COLOR[v.estado] ?? ""}`}>
                        {ESTADO_LABEL[v.estado] ?? v.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#0F1A2E]">
                      {v.precio
                        ? `$${v.precio.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/viajes/${v.id}`} className="text-xs text-[#1E3A5F] hover:underline">
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
