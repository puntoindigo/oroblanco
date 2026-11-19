/**
 * Migración: crea clientes desde los datos existentes en viajes y facturas.
 * Es idempotente — puede correr en cada deploy sin problema.
 *
 * Fase 1: viajes con texto libre sin clienteId → crea Clientes y los vincula.
 * Fase 2: facturas emitidas con razonSocial/cuit → crea Clientes faltantes.
 * Fase 3: viajes vinculados a facturas → hereda el clienteId desde la factura.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── helpers ───────────────────────────────────────────────────────────────────

function normalizarNombre(s) {
  return s?.trim().toUpperCase() ?? "";
}

/** Busca un Cliente por CUIT (si hay) o por nombre exacto */
async function buscarCliente(cuit, nombre) {
  if (cuit) {
    const c = await prisma.cliente.findFirst({ where: { cuit } });
    if (c) return c;
  }
  return prisma.cliente.findFirst({ where: { nombre: normalizarNombre(nombre) } });
}

// ── fase 1: viajes con datos en texto libre ───────────────────────────────────

async function migrarDesdeViajes() {
  const viajes = await prisma.viaje.findMany({
    where: { clienteId: null },
    select: { id: true, cliente: true, empresa: true, clienteEmail: true, clienteTel: true },
  });

  if (viajes.length === 0) {
    console.log("[fase1] Sin viajes por migrar.");
    return;
  }

  console.log(`[fase1] ${viajes.length} viaje(s) sin cliente...`);

  const grupos = new Map();
  for (const v of viajes) {
    const key = `${normalizarNombre(v.cliente)}|||${normalizarNombre(v.empresa)}`;
    if (!grupos.has(key)) grupos.set(key, { viaje: v, ids: [] });
    grupos.get(key).ids.push(v.id);
  }

  for (const { viaje, ids } of grupos.values()) {
    let cliente = await buscarCliente(null, viaje.cliente);
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: normalizarNombre(viaje.cliente),
          empresa: viaje.empresa || null,
          email: viaje.clienteEmail || null,
          tel: viaje.clienteTel || null,
        },
      });
      console.log(`[fase1] Creado: ${cliente.nombre}`);
    }
    const r = await prisma.viaje.updateMany({ where: { id: { in: ids } }, data: { clienteId: cliente.id } });
    console.log(`[fase1] Vinculados ${r.count} viaje(s) → "${cliente.nombre}"`);
  }
}

// ── fase 2: facturas emitidas → crear clientes faltantes ─────────────────────

async function migrarDesdeFacturas() {
  const facturas = await prisma.factura.findMany({
    where: { movimiento: "emitida" },
    select: { id: true, razonSocial: true, cuit: true, viajeId: true },
  });

  if (facturas.length === 0) {
    console.log("[fase2] Sin facturas emitidas.");
    return;
  }

  // Agrupar por CUIT (único) o por razonSocial si no hay CUIT
  const grupos = new Map();
  for (const f of facturas) {
    const key = f.cuit || normalizarNombre(f.razonSocial);
    if (!grupos.has(key)) grupos.set(key, { cuit: f.cuit, razonSocial: f.razonSocial, viajeIds: new Set() });
    if (f.viajeId) grupos.get(key).viajeIds.add(f.viajeId);
  }

  console.log(`[fase2] ${grupos.size} cliente(s) únicos en facturas emitidas...`);

  for (const { cuit, razonSocial, viajeIds } of grupos.values()) {
    let cliente = await buscarCliente(cuit, razonSocial);
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: normalizarNombre(razonSocial),
          cuit: cuit || null,
        },
      });
      console.log(`[fase2] Creado: ${cliente.nombre}${cuit ? ` (CUIT: ${cuit})` : ""}`);
    } else {
      // Actualizar CUIT si faltaba
      if (cuit && !cliente.cuit) {
        await prisma.cliente.update({ where: { id: cliente.id }, data: { cuit } });
        console.log(`[fase2] Actualizado CUIT de "${cliente.nombre}"`);
      }
    }

    // Vincular viajes de las facturas que aún no tienen clienteId
    if (viajeIds.size > 0) {
      const r = await prisma.viaje.updateMany({
        where: { id: { in: [...viajeIds] }, clienteId: null },
        data: { clienteId: cliente.id },
      });
      if (r.count > 0) console.log(`[fase2] Vinculados ${r.count} viaje(s) → "${cliente.nombre}" (vía facturas)`);
    }
  }
}

// ── fase 3: facturas emitidas sin viaje → crear viaje placeholder ─────────────

async function crearViajesDesdeFacturas() {
  const facturas = await prisma.factura.findMany({
    where: { movimiento: "emitida", viajeId: null },
    select: { id: true, razonSocial: true, cuit: true, fecha: true, total: true },
  });

  if (facturas.length === 0) {
    console.log("[fase3] Sin facturas emitidas sin viaje.");
    return;
  }

  console.log(`[fase3] Creando viajes para ${facturas.length} factura(s) sin viaje...`);

  for (const f of facturas) {
    const cliente = await buscarCliente(f.cuit, f.razonSocial);

    const viaje = await prisma.viaje.create({
      data: {
        cliente: normalizarNombre(f.razonSocial),
        clienteId: cliente?.id ?? null,
        fecha: f.fecha,
        precio: f.total,
        estado: "FACTURADO",
        origen: "Sin registrar",
        destino: "Sin registrar",
      },
    });

    await prisma.factura.update({ where: { id: f.id }, data: { viajeId: viaje.id } });
    console.log(`[fase3] Viaje creado para ${f.razonSocial} — $${f.total} (${f.fecha.toISOString().slice(0, 10)})`);
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  await migrarDesdeViajes();
  await migrarDesdeFacturas();
  await crearViajesDesdeFacturas();

  const totalClientes = await prisma.cliente.count();
  const totalViajes = await prisma.viaje.count();
  const sinCliente = await prisma.viaje.count({ where: { clienteId: null } });
  console.log(`[seed] Fin. Clientes: ${totalClientes}. Viajes: ${totalViajes}. Sin cliente: ${sinCliente}.`);
}

main()
  .catch((e) => { console.error("[seed] ERROR:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
