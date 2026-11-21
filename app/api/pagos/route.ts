import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const clienteId = searchParams.get("clienteId");
  const pagos = await prisma.pago.findMany({
    where: clienteId ? { clienteId } : undefined,
    include: {
      cliente: { select: { id: true, nombre: true, cuit: true } },
      facturas: { include: { factura: { select: { id: true, numero: true, total: true, estado: true } } } },
    },
    orderBy: { fechaAcreditacion: "asc" },
  });
  return NextResponse.json(pagos);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const { fecha, monto, tipo, nroCheque, idCheque, cmc7, fechaAcreditacion, emisorCuit, emisorNombre, clienteId, concepto, motivo, notas, facturaIds } = body;
  if (!fecha || !monto) return NextResponse.json({ error: "fecha y monto son requeridos" }, { status: 400 });

  const pago = await prisma.pago.create({
    data: {
      fecha: new Date(fecha),
      monto: parseFloat(monto),
      tipo: tipo ?? "cheque_cpd",
      nroCheque: nroCheque || null,
      idCheque: idCheque || null,
      cmc7: cmc7 || null,
      fechaAcreditacion: fechaAcreditacion ? new Date(fechaAcreditacion) : null,
      emisorCuit: emisorCuit || null,
      emisorNombre: emisorNombre || null,
      clienteId: clienteId || null,
      concepto: concepto || null,
      motivo: motivo || null,
      notas: notas || null,
    },
  });

  if (Array.isArray(facturaIds) && facturaIds.length > 0) {
    await prisma.pagoFactura.createMany({
      data: facturaIds.map((facturaId: string) => ({ pagoId: pago.id, facturaId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(pago, { status: 201 });
}
