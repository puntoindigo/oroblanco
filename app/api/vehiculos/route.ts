import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const vehiculos = await prisma.vehiculo.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(vehiculos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { patente, marca, modelo, anio, tipo } = await req.json();
  if (!patente || !marca || !modelo) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const v = await prisma.vehiculo.create({
    data: {
      patente: patente.toUpperCase().replace(/\s/g, ""),
      marca,
      modelo,
      anio: anio ? parseInt(anio) : null,
      tipo: tipo || "Camión",
    },
  });
  return NextResponse.json(v);
}
