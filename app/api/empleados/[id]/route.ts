import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const { nombre, apellido, cuit, categoria, fechaIngreso, activo } = body;
  const data: Record<string, unknown> = {};
  if (nombre !== undefined) data.nombre = nombre;
  if (apellido !== undefined) data.apellido = apellido ?? null;
  if (cuit !== undefined) data.cuit = cuit ?? null;
  if (categoria !== undefined) data.categoria = categoria ?? null;
  if (activo !== undefined) data.activo = activo;
  if (fechaIngreso !== undefined) data.fechaIngreso = fechaIngreso ? new Date(fechaIngreso) : null;

  const emp = await prisma.empleado.update({ where: { id }, data });
  return NextResponse.json(emp);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.empleado.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
