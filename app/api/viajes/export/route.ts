import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ESTADO_VIAJE_LABELS } from "@/lib/constants";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const viajes = await prisma.viaje.findMany({
    include: { vehiculo: true },
    orderBy: { fecha: "desc" },
  });

  const header = "Fecha,Cliente,Empresa,Tel,Email,Origen,Destino,Tipo Carga,Peso VGM (tn),Tara (tn),Precio (ARS),Estado,Nro Remito,Vehículo\n";
  const rows = viajes
    .map((v) =>
      [
        v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "",
        v.cliente,
        v.empresa ?? "",
        v.clienteTel ?? "",
        v.clienteEmail ?? "",
        v.origen,
        v.destino,
        v.tipoCarga,
        v.pesoVgm ?? "",
        v.tara ?? "",
        v.precio ?? "",
        ESTADO_VIAJE_LABELS[v.estado] ?? v.estado,
        v.nroRemito ?? "",
        v.vehiculo ? `${v.vehiculo.patente} ${v.vehiculo.marca} ${v.vehiculo.modelo}` : "",
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="viajes-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
