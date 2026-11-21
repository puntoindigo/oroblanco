/**
 * Seed inicial Oro Blanco:
 * - Empleado Torres Cristian Alejandro (legajo 5)
 * - Vehículo Ford Cargo 915 E (MKP987)
 * - Cliente por CUIT (emisor de los cheques)
 * - 7 cheques CPD → Facturas 164/165/166
 * Idempotente: usa upsert, puede correr múltiples veces.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Empleado ──────────────────────────────────────────────────────────────
  const empleado = await prisma.empleado.upsert({
    where: { legajo: "5" },
    update: {},
    create: {
      legajo: "5",
      nombre: "Cristian Alejandro",
      apellido: "Torres",
      cct: "40/88",
      categoria: "Conductor 1ra Cat",
      activo: true,
      fechaIngreso: new Date("2026-09-09"),
    },
  });
  console.log("✔ Empleado:", empleado.nombre, empleado.apellido);

  // ── Vehículo ──────────────────────────────────────────────────────────────
  const vehiculo = await prisma.vehiculo.upsert({
    where: { patente: "MKP987" },
    update: {
      motor: "36417915",
      chasis: "9BFVCE1N3DBB34861",
      vtoSeguro: new Date("2027-11-19"),
    },
    create: {
      patente: "MKP987",
      marca: "Ford",
      modelo: "Cargo 915 E",
      anio: 2013,
      tipo: "Camión Caja Metálica",
      motor: "36417915",
      chasis: "9BFVCE1N3DBB34861",
      vtoSeguro: new Date("2027-11-19"),
      activo: true,
    },
  });
  console.log("✔ Vehículo:", vehiculo.patente, vehiculo.marca, vehiculo.modelo);

  // ── Cliente (emisor de cheques, CUIT 23-35250140-9) ───────────────────────
  let cliente = await prisma.cliente.findFirst({
    where: { cuit: "23-35250140-9" },
  });
  if (!cliente) {
    cliente = await prisma.cliente.create({
      data: {
        nombre: "CLIENTE CUIT 23-35250140-9",
        cuit: "23-35250140-9",
        notas: "Emisor de cheques CPD nros. 30226414-30226420 (banco Municipal)",
      },
    });
    console.log("✔ Cliente creado:", cliente.nombre);
  } else {
    console.log("✔ Cliente ya existe:", cliente.nombre);
  }

  // ── Limpiar placeholders creados por versiones anteriores del seed ──────────
  const placeholders = await prisma.factura.findMany({
    where: {
      movimiento: "emitida",
      puntoVenta: "0001",
      total: 0,
      numero: { in: ["164", "165", "166"] },
      razonSocial: { startsWith: "CLIENTE CUIT" },
    },
  });
  if (placeholders.length > 0) {
    const ids = placeholders.map((f) => f.id);
    await prisma.pagoFactura.deleteMany({ where: { facturaId: { in: ids } } });
    await prisma.factura.deleteMany({ where: { id: { in: ids } } });
    console.log(`🗑  Eliminados ${placeholders.length} placeholder(s) de facturas`);
  }

  // ── Facturas 164 / 165 / 166 — buscar las reales importadas de ARCA ───────
  // ARCA exporta el número con ceros: "00000164". Buscamos por endsWith.
  const factNros = ["164", "165", "166"];
  const facturas = [];
  for (const nro of factNros) {
    const f = await prisma.factura.findFirst({
      where: { numero: { endsWith: nro }, movimiento: "emitida" },
    });
    if (f) {
      console.log(`✔ Factura ${nro} encontrada: ${f.puntoVenta}-${f.numero} (${f.razonSocial})`);
      facturas.push(f);
    } else {
      console.warn(`⚠  Factura terminada en ${nro} no encontrada — importar desde ARCA primero`);
    }
  }

  // ── 7 Cheques CPD → Pagos ─────────────────────────────────────────────────
  const cheques = [
    { nroCheque: "30226414", idCheque: "RZP90R7QOLR2EGJ", cmc7: "065090200030226414000000208 03", fechaAcreditacion: new Date("2026-12-21") },
    { nroCheque: "30226415", idCheque: "Q619L4ZKDLL97JZ", cmc7: "06509020003022641500000020803",  fechaAcreditacion: new Date("2026-12-22") },
    { nroCheque: "30226416", idCheque: "JWV9JP5RV339QMD", cmc7: "06509020003022641600000020803",  fechaAcreditacion: new Date("2026-12-23") },
    { nroCheque: "30226417", idCheque: "RPQ2GWPYZ3MNGLY", cmc7: "06509020003022641700000020803", fechaAcreditacion: new Date("2026-12-24") },
    { nroCheque: "30226418", idCheque: "XJE27YJV0E6N7MY", cmc7: "06509020003022641800000020803",  fechaAcreditacion: new Date("2026-12-25") },
    { nroCheque: "30226419", idCheque: "GOW9MYV3MD89EXD", cmc7: "06509020003022641900000020803", fechaAcreditacion: new Date("2026-12-26") },
    { nroCheque: "30226420", idCheque: "MKX9R8MZQRE2O6W", cmc7: "06509020003022642000000020803", fechaAcreditacion: new Date("2026-12-27") },
  ];

  for (const ch of cheques) {
    const pago = await prisma.pago.upsert({
      where: { idCheque: ch.idCheque },
      update: {},
      create: {
        fecha: new Date("2026-11-20"),
        fechaAcreditacion: ch.fechaAcreditacion,
        emisorCuit: "23-35250140-9",
        emisorNombre: "CUIT 23-35250140-9",
        clienteId: cliente.id,
        tipo: "cheque_cpd",
        nroCheque: ch.nroCheque,
        idCheque: ch.idCheque,
        cmc7: ch.cmc7,
        monto: 726000,
        concepto: "FAC",
        motivo: "flete",
        notas: "Banco Municipal — comprobante envío cheque",
      },
    });

    // Vincular pago a las 3 facturas (distribución a definir por el usuario)
    for (const f of facturas) {
      await prisma.pagoFactura.upsert({
        where: { pagoId_facturaId: { pagoId: pago.id, facturaId: f.id } },
        update: {},
        create: { pagoId: pago.id, facturaId: f.id },
      });
    }
    console.log(`✔ Cheque ${ch.nroCheque} ($726.000, vence ${ch.fechaAcreditacion.toLocaleDateString("es-AR")})`);
  }

  console.log("\n✅ Seed completado. Total pagos: 7 × $726.000 = $5.082.000");
  console.log("   → Vinculados a Facturas 164, 165, 166 (asignar importes por factura en el panel)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
