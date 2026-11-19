import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nombre, empresa, telefono, email,
      origen, destino, tipoCarga, peso,
      fechaEstimada, mensaje,
    } = body;

    if (!nombre || !telefono || !origen || !destino || !tipoCarga) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const url = new URL(req.url);
    const utmSource = url.searchParams.get("utm_source") ?? body.utmSource ?? null;
    const utmCampaign = url.searchParams.get("utm_campaign") ?? body.utmCampaign ?? null;

    const viaje = await prisma.viaje.create({
      data: {
        estado: "PRESUPUESTO",
        cliente: nombre,
        empresa: empresa || null,
        clienteTel: telefono,
        clienteEmail: email || null,
        origen,
        destino,
        tipoCarga,
        pesoVgm: peso ? parseFloat(peso) : null,
        fechaSolicitud: fechaEstimada ? new Date(fechaEstimada) : null,
        mensaje: mensaje || null,
        utmSource,
        utmCampaign,
      },
    });

    // Notificación por email (si RESEND_API_KEY está configurado)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.ADMIN_ALLOWED_EMAILS?.split(",")[0];
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
          from: "Oro Blanco <no-reply@puntoindigo.com>",
          to: ADMIN_EMAIL.trim(),
          subject: `Nuevo presupuesto de ${nombre}`,
          html: `<p><b>${nombre}</b> (${empresa ?? "particular"}) solicitó un presupuesto.</p>
<p>Ruta: ${origen} → ${destino}<br>Carga: ${tipoCarga}<br>Tel: ${telefono}</p>
<p>Ver en el <a href="https://oroblanco.puntoindigo.com/admin/viajes">panel de control</a>.</p>`,
        });
      } catch {
        // No bloquear la respuesta si falla el email
      }
    }

    return NextResponse.json({ ok: true, id: viaje.id });
  } catch (err) {
    console.error("[presupuesto]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
