import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes"); // "2026-11" format
  const movimiento = searchParams.get("movimiento");

  let fechaDesde: Date | undefined;
  let fechaHasta: Date | undefined;
  if (mes) {
    const [y, m] = mes.split("-").map(Number);
    fechaDesde = new Date(y, m - 1, 1);
    fechaHasta = new Date(y, m, 0, 23, 59, 59);
  }

  const facturas = await prisma.factura.findMany({
    where: {
      ...(fechaDesde && { fecha: { gte: fechaDesde, lte: fechaHasta } }),
      ...(movimiento && { movimiento }),
    },
    include: { viaje: { select: { origen: true, destino: true, cliente: true } } },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json(facturas);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { movimiento, tipo, puntoVenta, numero, fecha, cuit, razonSocial, montoNeto, iva, otrosTributos, total, viajeId } = body;

  const f = await prisma.factura.create({
    data: {
      movimiento: movimiento || "emitida",
      tipo,
      puntoVenta,
      numero,
      fecha: new Date(fecha),
      cuit,
      razonSocial,
      montoNeto: parseFloat(montoNeto ?? 0),
      iva: parseFloat(iva ?? 0),
      otrosTributos: parseFloat(otrosTributos ?? 0),
      total: parseFloat(total),
      viajeId: viajeId || null,
    },
  });
  return NextResponse.json(f);
}
