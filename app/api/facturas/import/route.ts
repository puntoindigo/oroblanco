import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ARCA exporta fechas como YYYY-MM-DD
function parseDate(s: string): Date | null {
  const clean = s.trim().replace(/"/g, "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return new Date(clean + "T00:00:00");
  // fallback DD/MM/AAAA por si acaso
  const m = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  return null;
}

// ARCA usa coma decimal y punto de miles: "787.500,00" → 787500
function parseNum(s: string): number {
  const clean = s.replace(/"/g, "").trim();
  if (!clean) return 0;
  return parseFloat(clean.replace(/\./g, "").replace(",", ".")) || 0;
}

function cleanStr(s: string): string {
  return s.replace(/^"|"$/g, "").trim();
}

// Mapa de código numérico de comprobante AFIP/ARCA → etiqueta
const TIPO_MAP: Record<string, string> = {
  "1": "FAC A", "2": "NDB A", "3": "NDC A",
  "6": "FAC B", "7": "NDB B", "8": "NDC B",
  "11": "FAC C", "12": "NDB C", "13": "NDC C",
  "51": "FAC M", "63": "LIQ A", "81": "TKT",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const movimiento = (formData.get("movimiento") as string) || "emitida";

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });

  const text = await file.text();

  // ARCA usa separador ";" — dividir líneas y columnas correctamente
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: "CSV vacío" }, { status: 400 });

  const headers = lines[0].split(";").map(cleanStr);

  // Localizar columnas por nombre exacto (tolerante a mayúsculas)
  const col = (name: string) => headers.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const colIncludes = (fragment: string) => headers.findIndex((h) => h.toLowerCase().includes(fragment.toLowerCase()));

  const iFecha  = col("Fecha de Emisión");
  const iTipo   = col("Tipo de Comprobante");
  const iPV     = col("Punto de Venta");
  const iNum    = col("Número Desde");
  const iTotal  = col("Imp. Total");
  const iTotIva = col("Total IVA");
  const iNeto   = col("Imp. Neto Gravado Total");
  const iOtros  = col("Otros Tributos");

  // CUIT y denominación difieren entre emitidos y recibidos
  const iCuit  = col("Nro. Doc. Receptor") !== -1  ? col("Nro. Doc. Receptor")  : col("Nro. Doc. Emisor");
  const iDenom = col("Denominación Receptor") !== -1 ? col("Denominación Receptor") : col("Denominación Emisor");

  if (iFecha === -1 || iTotal === -1) {
    return NextResponse.json(
      {
        error:
          "Formato no reconocido. El archivo debe ser el CSV de ARCA (Mis Comprobantes → Emitidos o Recibidos). " +
          `Columnas detectadas: ${headers.slice(0, 5).join(" | ")}`,
      },
      { status: 400 }
    );
  }

  const errors: string[] = [];
  let importados = 0;
  let omitidos = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    if (cols.length < 5) continue;

    const fecha = parseDate(cols[iFecha] ?? "");
    if (!fecha) {
      errors.push(`Fila ${i + 1}: fecha inválida "${cols[iFecha]}"`);
      continue;
    }

    const total = parseNum(cols[iTotal] ?? "0");
    if (total === 0) continue; // filas vacías o de totales

    const tipoCode = cleanStr(cols[iTipo] ?? "");
    const tipo = TIPO_MAP[tipoCode] ?? `Tipo ${tipoCode}`;
    const puntoVenta = cleanStr(cols[iPV] ?? "0001").padStart(4, "0");
    const numero = cleanStr(cols[iNum] ?? "0").padStart(8, "0");
    const cuit = cleanStr(cols[iCuit] ?? "");
    const razonSocial = cleanStr(cols[iDenom] ?? "");
    const montoNeto = parseNum(cols[iNeto] ?? "0");
    const iva = parseNum(cols[iTotIva] ?? "0");
    const otrosTributos = parseNum(iOtros !== -1 ? (cols[iOtros] ?? "0") : "0");

    // Deduplicar: si ya existe ese comprobante, saltar
    const existing = await prisma.factura.findFirst({
      where: { movimiento, puntoVenta, numero },
      select: { id: true },
    });
    if (existing) { omitidos++; continue; }

    await prisma.factura.create({
      data: { movimiento, tipo, puntoVenta, numero, fecha, cuit, razonSocial, montoNeto, iva, otrosTributos, total },
    });
    importados++;
  }

  return NextResponse.json({ importados, omitidos, errores: errors });
}
