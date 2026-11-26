/**
 * Precarga datos CCT para el empleado Torres (el único empleado actual).
 * Valores derivados del recibo muestra Agosto 2026.
 * Correr: node scripts/seed-empleado-cct.mjs
 */
import "dotenv/config";
import { readFileSync } from "fs";

// Cargar .env.local manualmente si existe
try {
  const local = readFileSync(".env.local", "utf8");
  for (const line of local.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
} catch {}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const TASAS = {
  sueldoDiario: 43811.09,
  diasHabilesMes: 25,
  presentismo: 106765.50,
  kmRate0323: 96.80,
  dietasKm: 34,
  diaViaticoRate0395: 3731.16,
  homeNights: 4,
  nocheViaticoRate0401: 27425.33,
  comidaMonto: 8.07,
  adicionalNoRem: 148260.76,
  pctCtbJubilacion: 10.72,
  pctCtbLey19032: 1.41,
  pctCtbAsigFamiliares: 4.68,
  pctCtbFondoEmpleo: 0.94,
  pctCtbObraSocial: 5.64,
  pctCtbArt: 20.43,
  artSumaFija: 1933.08,
  costoCCT: 6195.91,
  seguroVida: 424.62,
  pctDescJubilacion: 11,
  pctDescLey19032: 3,
  pctDescObraSocial: 3,
  pctDescCuotaSindical: 1.5,
  pctDescSeguroSepelio: 3,
};

async function main() {
  const empleados = await prisma.empleado.findMany();
  if (empleados.length === 0) {
    console.log("No hay empleados cargados.");
    return;
  }

  for (const emp of empleados) {
    console.log(`Actualizando: ${emp.nombre} ${emp.apellido ?? ""} (${emp.id})`);
    await prisma.empleado.update({
      where: { id: emp.id },
      data: {
        seccion: emp.seccion ?? "LARGA DISTANCIA",
        modalidad: emp.modalidad ?? "EFECTIVO",
        obraSocialNombre: emp.obraSocialNombre ?? "OSPA",
        lugaryFecha: emp.lugaryFecha ?? "Rosario, Agosto 2026",
        remuneracionAsignada: emp.remuneracionAsignada ?? 1291092.63,
        cctRates: emp.cctRates ?? TASAS,
      },
    });
    console.log("  → datos CCT precargados");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
