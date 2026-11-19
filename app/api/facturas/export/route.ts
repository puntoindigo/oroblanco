import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes"); // "2026-11"

  let fechaDesde: Date | undefined;
  let fechaHasta: Date | undefined;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    fechaDesde = new Date(y, m - 1, 1);
    fechaHasta = new Date(y, m, 0, 23, 59, 59);
  }

  const facturas = await prisma.factura.findMany({
    where: {
      movimiento: "emitida",
      ...(fechaDesde && { fecha: { gte: fechaDesde, lte: fechaHasta } }),
    },
    include: { viaje: true },
    orderBy: { fecha: "asc" },
  });

  const header = "Fecha,Tipo,Pto Venta,Número,CUIT,Razón Social,Monto Neto,IVA,Total,Provincia Origen,Provincia Destino,Cliente Viaje\n";
  const rows = facturas
    .map((f) =>
      [
        new Date(f.fecha).toLocaleDateString("es-AR"),
        f.tipo,
        f.puntoVenta,
        f.numero,
        f.cuit,
        f.razonSocial,
        f.montoNeto.toFixed(2),
        f.iva.toFixed(2),
        f.total.toFixed(2),
        f.viaje?.origen ?? "",
        f.viaje?.destino ?? "",
        f.viaje?.cliente ?? "",
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const nombre = mes ? `facturas-${mes}` : `facturas-${new Date().toISOString().split("T")[0]}`;

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}.csv"`,
    },
  });
}
