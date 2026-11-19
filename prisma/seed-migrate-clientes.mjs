/**
 * Migración one-time: agrupa los viajes por datos de cliente (texto libre),
 * crea un registro Cliente por cada grupo único y vincula los viajes.
 * Es idempotente: si el viaje ya tiene clienteId lo saltea.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const viajes = await prisma.viaje.findMany({
    where: { clienteId: null },
    select: {
      id: true,
      cliente: true,
      empresa: true,
      clienteEmail: true,
      clienteTel: true,
    },
  });

  if (viajes.length === 0) {
    console.log("[seed] No hay viajes sin cliente — nada que migrar.");
    return;
  }

  console.log(`[seed] Migrando ${viajes.length} viaje(s)...`);

  // Agrupar por clave de cliente (nombre + empresa)
  const grupos = new Map();
  for (const v of viajes) {
    const key = `${v.cliente}|||${v.empresa ?? ""}`;
    if (!grupos.has(key)) {
      grupos.set(key, { viaje: v, ids: [] });
    }
    grupos.get(key).ids.push(v.id);
  }

  for (const { viaje, ids } of grupos.values()) {
    // Crear o buscar el Cliente
    let cliente = await prisma.cliente.findFirst({
      where: { nombre: viaje.cliente, empresa: viaje.empresa ?? null },
    });

    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: viaje.cliente,
          empresa: viaje.empresa || null,
          email: viaje.clienteEmail || null,
          tel: viaje.clienteTel || null,
        },
      });
      console.log(`[seed] Creado cliente: ${cliente.nombre} (id=${cliente.id})`);
    } else {
      console.log(`[seed] Cliente ya existe: ${cliente.nombre} (id=${cliente.id})`);
    }

    // Vincular los viajes
    const updated = await prisma.viaje.updateMany({
      where: { id: { in: ids } },
      data: { clienteId: cliente.id },
    });
    console.log(`[seed] Vinculados ${updated.count} viaje(s) a "${cliente.nombre}"`);
  }

  console.log("[seed] Migración completada.");
}

main()
  .catch((e) => { console.error("[seed] ERROR:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
