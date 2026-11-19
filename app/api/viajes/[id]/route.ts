import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await prisma.viaje.update({
    where: { id },
    data: {
      ...(body.fecha !== undefined && { fecha: body.fecha ? new Date(body.fecha) : null }),
      ...(body.fechaSolicitud !== undefined && { fechaSolicitud: body.fechaSolicitud ? new Date(body.fechaSolicitud) : null }),
      ...(body.origen && { origen: body.origen }),
      ...(body.destino && { destino: body.destino }),
      ...(body.tipoCarga && { tipoCarga: body.tipoCarga }),
      ...(body.pesoVgm !== undefined && { pesoVgm: body.pesoVgm ? parseFloat(body.pesoVgm) : null }),
      ...(body.tara !== undefined && { tara: body.tara ? parseFloat(body.tara) : null }),
      ...(body.cliente && { cliente: body.cliente }),
      ...(body.empresa !== undefined && { empresa: body.empresa || null }),
      ...(body.clienteEmail !== undefined && { clienteEmail: body.clienteEmail || null }),
      ...(body.clienteTel !== undefined && { clienteTel: body.clienteTel || null }),
      ...(body.precio !== undefined && { precio: body.precio ? parseFloat(body.precio) : null }),
      ...(body.precioConIva !== undefined && { precioConIva: body.precioConIva === "true" || body.precioConIva === true }),
      ...(body.estado && { estado: body.estado }),
      ...(body.notas !== undefined && { notas: body.notas || null }),
      ...(body.nroRemito !== undefined && { nroRemito: body.nroRemito || null }),
      ...(body.vehiculoId !== undefined && { vehiculoId: body.vehiculoId || null }),
      ...(body.mensaje !== undefined && { mensaje: body.mensaje || null }),
      ...(body.clienteId !== undefined && { clienteId: body.clienteId || null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.viaje.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
