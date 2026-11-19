import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const {
    fecha, fechaSolicitud, origen, destino, tipoCarga,
    pesoVgm, tara, cliente, empresa, clienteEmail, clienteTel,
    precio, precioConIva, notas, nroRemito, estado, vehiculoId, mensaje,
  } = body;

  const viaje = await prisma.viaje.create({
    data: {
      fecha: fecha ? new Date(fecha) : null,
      fechaSolicitud: fechaSolicitud ? new Date(fechaSolicitud) : null,
      origen,
      destino,
      tipoCarga: tipoCarga || "Carga General",
      pesoVgm: pesoVgm ? parseFloat(pesoVgm) : null,
      tara: tara ? parseFloat(tara) : null,
      cliente,
      empresa: empresa || null,
      clienteEmail: clienteEmail || null,
      clienteTel: clienteTel || null,
      precio: precio ? parseFloat(precio) : null,
      precioConIva: precioConIva === "false" || precioConIva === false ? false : true,
      notas: notas || null,
      nroRemito: nroRemito || null,
      estado: estado || "PENDIENTE",
      vehiculoId: vehiculoId || null,
      mensaje: mensaje || null,
    },
  });

  return NextResponse.json(viaje);
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");

  const viajes = await prisma.viaje.findMany({
    where: estado ? { estado: estado as never } : undefined,
    include: { vehiculo: { select: { patente: true, marca: true, modelo: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(viajes);
}
