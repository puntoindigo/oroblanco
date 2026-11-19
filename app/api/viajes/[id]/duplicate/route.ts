import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.viaje.findUnique({ where: { id } });
  if (!original) return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _c, updatedAt: _u, utmSource: _s, utmCampaign: _cam, ...rest } = original;

  const nuevo = await prisma.viaje.create({
    data: {
      ...rest,
      estado: "PENDIENTE",
      fechaSolicitud: new Date(),
      fecha: null,
      nroRemito: null,
    },
  });

  return NextResponse.json(nuevo);
}
