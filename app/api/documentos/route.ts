import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const empleadoId = searchParams.get("empleadoId");
  const vehiculoId = searchParams.get("vehiculoId");
  const viajeId = searchParams.get("viajeId");
  const tipo = searchParams.get("tipo");

  const docs = await prisma.documento.findMany({
    where: {
      ...(empleadoId ? { empleadoId } : {}),
      ...(vehiculoId ? { vehiculoId } : {}),
      ...(viajeId ? { viajeId } : {}),
      ...(tipo ? { tipo } : {}),
    },
    include: {
      empleado: { select: { id: true, nombre: true, apellido: true } },
      vehiculo: { select: { id: true, patente: true, modelo: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { tipo, nombre, url, fecha, monto, empleadoId, vehiculoId, viajeId, notas } = body;
  if (!tipo || !nombre) return NextResponse.json({ error: "tipo y nombre son requeridos" }, { status: 400 });

  const doc = await prisma.documento.create({
    data: {
      tipo,
      nombre,
      url: url || null,
      fecha: fecha ? new Date(fecha) : null,
      monto: monto ? parseFloat(monto) : null,
      empleadoId: empleadoId || null,
      vehiculoId: vehiculoId || null,
      viajeId: viajeId || null,
      notas: notas || null,
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
