import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const viajes = await prisma.viaje.findMany({ orderBy: { fecha: "desc" } });

  const header = "Fecha,Cliente,Email,Tel,Origen,Destino,Tipo Carga,Peso (tn),Precio (ARS),Estado,Nro Remito\n";
  const rows = viajes
    .map((v) =>
      [
        new Date(v.fecha).toLocaleDateString("es-AR"),
        v.cliente,
        v.clienteEmail ?? "",
        v.clienteTel ?? "",
        v.origen,
        v.destino,
        v.tipoCarga,
        v.peso ?? "",
        v.precio,
        v.estado,
        v.nroRemito ?? "",
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
