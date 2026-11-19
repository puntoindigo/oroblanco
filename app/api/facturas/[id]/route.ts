import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.factura.update({
    where: { id },
    data: {
      ...(body.viajeId !== undefined && { viajeId: body.viajeId || null }),
      ...(body.tipo && { tipo: body.tipo }),
      ...(body.total !== undefined && { total: parseFloat(body.total) }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.factura.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
