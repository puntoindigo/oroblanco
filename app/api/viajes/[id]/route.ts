import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.viaje.update({
    where: { id },
    data: {
      ...(body.fecha && { fecha: new Date(body.fecha) }),
      ...(body.origen && { origen: body.origen }),
      ...(body.destino && { destino: body.destino }),
      ...(body.tipoCarga && { tipoCarga: body.tipoCarga }),
      ...(body.peso !== undefined && { peso: body.peso }),
      ...(body.cliente && { cliente: body.cliente }),
      ...(body.clienteEmail !== undefined && { clienteEmail: body.clienteEmail || null }),
      ...(body.clienteTel !== undefined && { clienteTel: body.clienteTel || null }),
      ...(body.precio !== undefined && { precio: body.precio }),
      ...(body.estado && { estado: body.estado }),
      ...(body.notas !== undefined && { notas: body.notas || null }),
      ...(body.nroRemito !== undefined && { nroRemito: body.nroRemito || null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.viaje.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
