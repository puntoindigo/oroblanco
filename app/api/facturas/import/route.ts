import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/** Parsea la fecha DD/MM/AAAA que exporta ARCA. */
function parseArDate(s: string): Date | null {
  const clean = s.trim().replace(/"/g, "");
  const m = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function parseNum(s: string): number {
  return parseFloat(s.replace(/"/g, "").replace(/\./g, "").replace(",", ".")) || 0;
}

function cleanStr(s: string): string {
  return s.replace(/^"|"$/g, "").trim();
}

function detectMovimiento(headers: string[]): "emitida" | "recibida" {
  const h = headers.join(",").toLowerCase();
  return h.includes("receptor") || h.includes("emisor") && !h.includes("receptor")
    ? "emitida"
    : h.includes("emisor") && !h.includes("receptor")
    ? "recibida"
    : "emitida";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const movimiento = (formData.get("movimiento") as string) || "emitida";

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: "CSV vacío" }, { status: 400 });

  const rawHeaders = lines[0].split(",");
  const headers = rawHeaders.map(cleanStr);

  // Detectar índices de columnas clave (ARCA puede variar el orden)
  const idx = (key: string) => headers.findIndex((h) => h.toLowerCase().includes(key.toLowerCase()));

  const iFecha = idx("Fecha");
  const iTipo = idx("Tipo");
  const iPV = idx("Punto de Venta");
  const iNum = idx("Número Desde") !== -1 ? idx("Número Desde") : idx("Número");
  const iCuit = idx("Nro. Doc") !== -1 ? idx("Nro. Doc") : idx("CUIT");
  const iDenom = idx("Denominación") !== -1 ? idx("Denominación") : idx("Razón Social");
  const iNeto = idx("Neto Gravado") !== -1 ? idx("Neto Gravado") : idx("Importe Neto");
  const iIva = idx("IVA");
  const iOtros = idx("Otros Trib") !== -1 ? idx("Otros Trib") : idx("Otros Tributos");
  const iTotal = idx("Total");

  if (iFecha === -1 || iTotal === -1) {
    return NextResponse.json(
      { error: "Formato no reconocido. Verificá que sea el CSV de ARCA (Mis Comprobantes)." },
      { status: 400 }
    );
  }

  const records = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 3) continue;

    const fecha = parseArDate(cols[iFecha] ?? "");
    if (!fecha) {
      errors.push(`Fila ${i + 1}: fecha inválida (${cols[iFecha]})`);
      continue;
    }

    const total = parseNum(cols[iTotal] ?? "0");
    if (total === 0) continue;

    records.push({
      movimiento,
      tipo: cleanStr(cols[iTipo] ?? "FACTURA"),
      puntoVenta: cleanStr(cols[iPV] ?? "0001"),
      numero: cleanStr(cols[iNum] ?? "0"),
      fecha,
      cuit: cleanStr(cols[iCuit] ?? ""),
      razonSocial: cleanStr(cols[iDenom] ?? ""),
      montoNeto: parseNum(cols[iNeto] ?? "0"),
      iva: parseNum(cols[iIva] ?? "0"),
      otrosTributos: parseNum(cols[iOtros] ?? "0"),
      total,
    });
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "No se encontraron registros válidos", errores: errors }, { status: 400 });
  }

  let importados = 0;
  let omitidos = 0;
  for (const r of records) {
    const existing = await prisma.factura.findFirst({
      where: { movimiento: r.movimiento, puntoVenta: r.puntoVenta, numero: r.numero },
      select: { id: true },
    });
    if (existing) { omitidos++; continue; }
    await prisma.factura.create({ data: r });
    importados++;
  }

  return NextResponse.json({ importados, omitidos, errores: errors });
}
