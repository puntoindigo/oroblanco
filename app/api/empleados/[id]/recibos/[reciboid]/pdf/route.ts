import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { ReciboDocument } from "@/components/pdf/recibo-pdf";
import type { ReciboData } from "@/components/pdf/recibo-pdf";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = ReactElement<any, any>;

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; reciboid: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id, reciboid } = await params;

  const recibo = await prisma.reciboSueldo.findUnique({
    where: { id: reciboid },
    include: { empleado: true },
  });

  if (!recibo || recibo.empleadoId !== id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const empleado = {
    nombre: recibo.empleado.nombre,
    apellido: recibo.empleado.apellido,
    legajo: recibo.empleado.legajo,
    cuit: recibo.empleado.cuit,
    cct: recibo.empleado.cct,
    categoria: recibo.empleado.categoria,
    fechaIngreso: recibo.empleado.fechaIngreso,
  };

  const element = createElement(ReciboDocument, {
    empleado,
    recibo: recibo.data as unknown as ReciboData,
  }) as AnyElement;

  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  const mes = String(recibo.periodoMes).padStart(2, "0");
  const filename = `recibo-${recibo.periodoAnio}-${mes}.pdf`;

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
