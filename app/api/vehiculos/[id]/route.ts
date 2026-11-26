import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const { patente, marca, modelo, anio, tipo, motor, chasis, ciaSeguro, activo } = body;
  const data: Record<string, unknown> = {};
  if (patente !== undefined) data.patente = patente.toUpperCase().replace(/\s/g, "");
  if (marca !== undefined) data.marca = marca;
  if (modelo !== undefined) data.modelo = modelo;
  if (anio !== undefined) data.anio = anio ? parseInt(anio) : null;
  if (tipo !== undefined) data.tipo = tipo;
  if (motor !== undefined) data.motor = motor || null;
  if (chasis !== undefined) data.chasis = chasis || null;
  if (ciaSeguro !== undefined) data.ciaSeguro = ciaSeguro || null;
  if (activo !== undefined) data.activo = activo;

  const updated = await prisma.vehiculo.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.vehiculo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
