import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      viajes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          estado: true,
          fecha: true,
          origen: true,
          destino: true,
          precio: true,
          nroRemito: true,
        },
      },
      _count: { select: { viajes: true } },
    },
  });
  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      nombre: body.nombre,
      empresa: body.empresa || null,
      email: body.email || null,
      tel: body.tel || null,
      cuit: body.cuit || null,
      notas: body.notas || null,
    },
  });
  return NextResponse.json(cliente);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const count = await prisma.viaje.count({ where: { clienteId: id } });
  if (count > 0)
    return NextResponse.json({ error: "El cliente tiene viajes asociados" }, { status: 409 });

  await prisma.cliente.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
