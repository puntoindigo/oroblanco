import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.vehiculo.update({
    where: { id },
    data: {
      ...(body.patente && { patente: body.patente.toUpperCase().replace(/\s/g, "") }),
      ...(body.marca && { marca: body.marca }),
      ...(body.modelo && { modelo: body.modelo }),
      ...(body.anio !== undefined && { anio: body.anio ? parseInt(body.anio) : null }),
      ...(body.tipo && { tipo: body.tipo }),
      ...(body.activo !== undefined && { activo: body.activo }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.vehiculo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
