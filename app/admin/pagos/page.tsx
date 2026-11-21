import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatARS(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

export default async function PagosPage() {
  const pagos = await prisma.pago.findMany({
    include: {
      cliente: { select: { nombre: true, cuit: true } },
      facturas: {
        include: { factura: { select: { numero: true, total: true, estado: true } } },
      },
    },
    orderBy: { fechaAcreditacion: "asc" },
  });

  const total = pagos.reduce((s, p) => s + p.monto, 0);
  const pendientes = pagos.filter((p) => {
    const hoy = new Date();
    return p.fechaAcreditacion && p.fechaAcreditacion > hoy;
  });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Pagos / Cheques</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {pagos.length} registros · Total{" "}
            <span className="font-semibold text-[#1E3A5F]">{formatARS(total)}</span>
            {pendientes.length > 0 && (
              <> · <span className="text-amber-700">{pendientes.length} por acreditar</span></>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Cheque</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Emisor</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Monto</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Acreditación</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Facturas</th>
                <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagos.map((pago) => {
                const hoy = new Date();
                const acreditado = pago.fechaAcreditacion ? pago.fechaAcreditacion <= hoy : null;
                return (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-[#1E3A5F]">
                        {pago.nroCheque ?? "—"}
                      </span>
                      {pago.tipo === "cheque_cpd" && (
                        <span className="ml-2 text-[9px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          CPD
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">
                      <span className="text-xs">{pago.emisorNombre ?? pago.emisorCuit ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#0F1A2E]">
                      {formatARS(pago.monto)}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568]">
                      {pago.fechaAcreditacion
                        ? new Date(pago.fechaAcreditacion).toLocaleDateString("es-AR")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-[#4A5568]">
                      {pago.facturas.length > 0
                        ? pago.facturas.map((pf) => `FAC ${pf.factura.numero}`).join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {acreditado === null ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : acreditado ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Acreditado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4A5568]">
                    No hay pagos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
