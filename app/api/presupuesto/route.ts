import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      nombre,
      empresa,
      telefono,
      email,
      origen,
      destino,
      tipoCarga,
      peso,
      fechaEstimada,
      mensaje,
    } = body;

    if (!nombre || !telefono || !email || !origen || !destino || !tipoCarga) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // UTM tracking desde query params
    const url = new URL(req.url);
    const utmSource = url.searchParams.get("utm_source") ?? undefined;
    const utmCampaign = url.searchParams.get("utm_campaign") ?? undefined;

    const presupuesto = await prisma.presupuesto.create({
      data: {
        nombre,
        empresa: empresa || null,
        telefono,
        email,
        origen,
        destino,
        tipoCarga,
        peso: peso || null,
        fechaEstimada: fechaEstimada ? new Date(fechaEstimada) : null,
        mensaje: mensaje || null,
        utmSource: utmSource ?? null,
        utmCampaign: utmCampaign ?? null,
      },
    });

    // Enviar email de notificación
    if (process.env.RESEND_API_KEY && process.env.EMAIL_TO) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Oro Blanco <notificaciones@oroblancolog.com.ar>",
        to: process.env.EMAIL_TO,
        subject: `Nuevo presupuesto: ${origen} → ${destino} (${tipoCarga})`,
        html: `
          <h2>Nuevo presupuesto de flete</h2>
          <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Nombre</td><td style="padding:6px 12px">${nombre}</td></tr>
            ${empresa ? `<tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Empresa</td><td style="padding:6px 12px">${empresa}</td></tr>` : ""}
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Teléfono</td><td style="padding:6px 12px">${telefono}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Email</td><td style="padding:6px 12px">${email}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Origen</td><td style="padding:6px 12px">${origen}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Destino</td><td style="padding:6px 12px">${destino}</td></tr>
            <tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Tipo de carga</td><td style="padding:6px 12px">${tipoCarga}</td></tr>
            ${peso ? `<tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Peso</td><td style="padding:6px 12px">${peso}</td></tr>` : ""}
            ${fechaEstimada ? `<tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Fecha estimada</td><td style="padding:6px 12px">${fechaEstimada}</td></tr>` : ""}
            ${mensaje ? `<tr><td style="padding:6px 12px;background:#f5f5f5;font-weight:bold">Mensaje</td><td style="padding:6px 12px">${mensaje}</td></tr>` : ""}
          </table>
          <p style="margin-top:16px;font-size:12px;color:#666">
            ID: ${presupuesto.id} · ${new Date().toLocaleString("es-AR")}
            ${utmSource ? ` · Fuente: ${utmSource}` : ""}
          </p>
        `,
      });
    }

    return NextResponse.json({ ok: true, id: presupuesto.id });
  } catch (error) {
    console.error("Error presupuesto:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
