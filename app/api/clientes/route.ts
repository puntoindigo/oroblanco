import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const clientes = await prisma.cliente.findMany({
    where: q
      ? {
          OR: [
            { nombre: { contains: q, mode: "insensitive" } },
            { empresa: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nombre: "asc" },
    take: 50,
    include: { _count: { select: { viajes: true } } },
  });
  return NextResponse.json(clientes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cliente = await prisma.cliente.create({
    data: {
      nombre: body.nombre,
      empresa: body.empresa || null,
      email: body.email || null,
      tel: body.tel || null,
      cuit: body.cuit || null,
      notas: body.notas || null,
    },
  });
  return NextResponse.json(cliente, { status: 201 });
}
