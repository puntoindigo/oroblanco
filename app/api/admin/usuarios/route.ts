import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  try {
    const user = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        addedBy: session.user.email,
      },
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "El email ya existe o hubo un error" }, { status: 400 });
  }
}
