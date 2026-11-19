import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.adminUser.findUnique({ where: { id } });
  if (user?.email === session.email) {
    return NextResponse.json({ error: "No podés quitarte a vos mismo" }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
