import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST { pagoIds: string[], facturaNumeros: string[] }
// Busca facturas por endsWith(numero) y crea los vínculos PagoFactura
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { pagoIds, facturaNumeros } = await req.json();
  if (!Array.isArray(pagoIds) || pagoIds.length === 0)
    return NextResponse.json({ error: "pagoIds requerido" }, { status: 400 });
  if (!Array.isArray(facturaNumeros) || facturaNumeros.length === 0)
    return NextResponse.json({ error: "facturaNumeros requerido" }, { status: 400 });

  // Buscar facturas reales: numero termina en el valor dado (maneja ceros ARCA)
  const facturas: Array<{ id: string; numero: string; puntoVenta: string }> = [];
  const noEncontradas: string[] = [];

  for (const nro of facturaNumeros) {
    const f = await prisma.factura.findFirst({
      where: { numero: { endsWith: nro }, movimiento: "emitida" },
      select: { id: true, numero: true, puntoVenta: true },
    });
    if (f) facturas.push(f);
    else noEncontradas.push(nro);
  }

  if (facturas.length === 0)
    return NextResponse.json({ error: `Ninguna factura encontrada: ${noEncontradas.join(", ")}` }, { status: 404 });

  // Crear vínculos
  let creados = 0;
  for (const pagoId of pagoIds) {
    for (const f of facturas) {
      await prisma.pagoFactura.upsert({
        where: { pagoId_facturaId: { pagoId, facturaId: f.id } },
        update: {},
        create: { pagoId, facturaId: f.id },
      });
      creados++;
    }
  }

  return NextResponse.json({
    ok: true,
    vinculados: creados,
    facturas: facturas.map((f) => `${f.puntoVenta}-${f.numero}`),
    noEncontradas,
  });
}
