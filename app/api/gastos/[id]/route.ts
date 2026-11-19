import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.gasto.update({
    where: { id },
    data: {
      ...(body.fecha && { fecha: new Date(body.fecha) }),
      ...(body.descripcion && { descripcion: body.descripcion }),
      ...(body.monto !== undefined && { monto: parseFloat(body.monto) }),
      ...(body.tipo && { tipo: body.tipo }),
      ...(body.nroComprobante !== undefined && { nroComprobante: body.nroComprobante || null }),
      ...(body.vehiculoId !== undefined && { vehiculoId: body.vehiculoId || null }),
      ...(body.viajeId !== undefined && { viajeId: body.viajeId || null }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.gasto.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
