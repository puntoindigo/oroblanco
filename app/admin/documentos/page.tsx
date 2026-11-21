import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  seguro_vehiculo: "Seguro Vehículo",
  recibo_sueldo: "Recibo Sueldo",
  gasto_combustible: "Combustible",
  comprobante_pago: "Comprobante Pago",
  otro: "Otro",
};

const TIPO_COLOR: Record<string, string> = {
  seguro_vehiculo: "bg-blue-100 text-blue-800",
  recibo_sueldo: "bg-purple-100 text-purple-800",
  gasto_combustible: "bg-orange-100 text-orange-800",
  comprobante_pago: "bg-green-100 text-green-800",
  otro: "bg-gray-100 text-gray-700",
};

export default async function DocumentosPage() {
  const documentos = await prisma.documento.findMany({
    include: {
      empleado: { select: { nombre: true, apellido: true } },
      vehiculo: { select: { patente: true, modelo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const byTipo = documentos.reduce<Record<string, number>>((acc, d) => {
    acc[d.tipo] = (acc[d.tipo] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Documentos</h1>
        <p className="text-[#4A5568] text-sm mt-1">
          {documentos.length} archivos ·{" "}
          {Object.entries(byTipo)
            .map(([t, c]) => `${TIPO_LABEL[t] ?? t}: ${c}`)
            .join(" · ")}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden sm:table-cell">Vinculado a</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Fecha</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Monto</th>
              <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Archivo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {documentos.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-[#0F1A2E]">{doc.nombre}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      TIPO_COLOR[doc.tipo] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {TIPO_LABEL[doc.tipo] ?? doc.tipo}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#4A5568]">
                  {doc.empleado
                    ? `${doc.empleado.apellido ?? ""} ${doc.empleado.nombre}`
                    : doc.vehiculo
                    ? `${doc.vehiculo.patente} · ${doc.vehiculo.modelo}`
                    : "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                  {doc.fecha ? new Date(doc.fecha).toLocaleDateString("es-AR") : "—"}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                  {doc.monto != null ? `$${doc.monto.toLocaleString("es-AR")}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#1E3A5F] hover:underline"
                    >
                      Ver
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Sin archivo</span>
                  )}
                </td>
              </tr>
            ))}
            {documentos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#4A5568]">
                  No hay documentos registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
