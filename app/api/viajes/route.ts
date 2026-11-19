import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { fecha, origen, destino, tipoCarga, peso, cliente, clienteEmail, clienteTel, precio, notas, nroRemito } = body;

  const viaje = await prisma.viaje.create({
    data: {
      fecha: new Date(fecha),
      origen,
      destino,
      tipoCarga,
      peso: peso ? parseFloat(peso) : null,
      cliente,
      clienteEmail: clienteEmail || null,
      clienteTel: clienteTel || null,
      precio: parseFloat(precio),
      notas: notas || null,
      nroRemito: nroRemito || null,
    },
  });

  return NextResponse.json(viaje);
}
