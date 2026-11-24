import { prisma } from "@/lib/prisma";
import DocumentosTable from "@/components/admin/documentos-table";

export const dynamic = "force-dynamic";

const TIPO_LABEL: Record<string, string> = {
  seguro_vehiculo: "Seguro Vehículo",
  recibo_sueldo: "Recibo Sueldo",
  gasto_combustible: "Combustible",
  comprobante_pago: "Comprobante Pago",
  otro: "Otro",
};

export default async function DocumentosPage() {
  const rawDocs = await prisma.documento.findMany({
    include: {
      empleado: { select: { nombre: true, apellido: true } },
      vehiculo: { select: { patente: true, modelo: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const documentos = rawDocs.map((d) => ({
    ...d,
    fecha: d.fecha ? d.fecha.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

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
      <DocumentosTable documentos={documentos} />
    </div>
  );
}
