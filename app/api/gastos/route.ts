import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const gastos = await prisma.gasto.findMany({
    include: {
      vehiculo: { select: { patente: true } },
      viaje: { select: { origen: true, destino: true, cliente: true } },
    },
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(gastos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { fecha, descripcion, monto, tipo, nroComprobante, vehiculoId, viajeId } = await req.json();
  if (!fecha || !descripcion || !monto) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const g = await prisma.gasto.create({
    data: {
      fecha: new Date(fecha),
      descripcion,
      monto: parseFloat(monto),
      tipo: tipo || "OTRO",
      nroComprobante: nroComprobante || null,
      vehiculoId: vehiculoId || null,
      viajeId: viajeId || null,
    },
    include: {
      vehiculo: { select: { patente: true } },
      viaje: { select: { origen: true, destino: true, cliente: true } },
    },
  });
  return NextResponse.json(g);
}
