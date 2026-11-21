import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const empleados = await prisma.empleado.findMany({ orderBy: { apellido: "asc" } });
  return NextResponse.json(empleados);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { nombre, apellido, legajo, cuit, cct, categoria, fechaIngreso } = body;
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  const emp = await prisma.empleado.create({
    data: {
      nombre,
      apellido: apellido ?? null,
      legajo: legajo || null,
      cuit: cuit || null,
      cct: cct || null,
      categoria: categoria || null,
      fechaIngreso: fechaIngreso ? new Date(fechaIngreso) : null,
    },
  });
  return NextResponse.json(emp, { status: 201 });
}
