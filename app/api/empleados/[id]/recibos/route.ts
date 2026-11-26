import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const recibos = await prisma.reciboSueldo.findMany({
    where: { empleadoId: id },
    orderBy: [{ periodoAnio: "desc" }, { periodoMes: "desc" }],
  });
  return NextResponse.json(recibos);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { periodoAnio, periodoMes, data } = body;
  if (!periodoAnio || !periodoMes || !data) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }
  try {
    const recibo = await prisma.reciboSueldo.create({
      data: { empleadoId: id, periodoAnio: Number(periodoAnio), periodoMes: Number(periodoMes), data },
    });
    return NextResponse.json(recibo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya existe un recibo para ese período" }, { status: 409 });
  }
}
