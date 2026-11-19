import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getStats() {
  const [presupuestos, enCurso, pendientes, totalViajes] = await Promise.all([
    prisma.viaje.count({ where: { estado: "PRESUPUESTO" } }),
    prisma.viaje.count({ where: { estado: "EN_CURSO" } }),
    prisma.viaje.count({ where: { estado: "PENDIENTE" } }),
    prisma.viaje.count(),
  ]);
  const totalMes = await prisma.viaje.aggregate({
    _sum: { precio: true },
    where: {
      estado: { in: ["FACTURADO", "COBRADO"] },
      fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });
  return { presupuestos, enCurso, pendientes, totalViajes, totalMes: totalMes._sum.precio ?? 0 };
}

export default async function PanelControl() {
  const stats = await getStats();

  const cards = [
    {
      label: "Presupuestos pendientes",
      value: stats.presupuestos,
      sub: "Sin confirmar",
      icon: "📋",
      href: "/admin/viajes",
      highlight: stats.presupuestos > 0,
      color: "border-[#C9A84C]",
    },
    {
      label: "Viajes en curso",
      value: stats.enCurso,
      sub: `${stats.pendientes} pendientes de salida`,
      icon: "🚛",
      href: "/admin/viajes",
      highlight: false,
      color: "border-blue-200",
    },
    {
      label: "Total facturado este mes",
      value: `$${stats.totalMes.toLocaleString("es-AR")}`,
      sub: `${stats.totalViajes} viajes en total`,
      icon: "💰",
      href: "/admin/facturas",
      highlight: false,
      color: "border-green-200",
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Panel de control</h1>
        <p className="text-[#4A5568] text-sm mt-1">Resumen operativo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`block bg-white rounded-xl p-5 border transition-all hover:shadow-md ${c.highlight ? c.color + " shadow-sm" : "border-gray-100"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              {c.highlight && (
                <span className="bg-[#C9A84C] text-[#0F1A2E] text-xs font-bold px-2 py-0.5 rounded-full">Atención</span>
              )}
            </div>
            <div className="text-3xl font-bold text-[#0F1A2E] mb-0.5">{c.value}</div>
            <div className="text-sm font-medium text-[#1E3A5F]">{c.label}</div>
            <div className="text-xs text-[#4A5568] mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/viajes/nuevo", label: "+ Nuevo viaje", bg: "bg-[#1E3A5F] text-white hover:bg-[#0F1A2E]" },
          { href: "/admin/vehiculos", label: "🚐 Vehículos", bg: "bg-white border border-gray-200 text-[#1E3A5F] hover:bg-gray-50" },
          { href: "/admin/gastos", label: "💸 Gastos", bg: "bg-white border border-gray-200 text-[#1E3A5F] hover:bg-gray-50" },
          { href: "/admin/facturas", label: "🧾 Facturas", bg: "bg-white border border-gray-200 text-[#1E3A5F] hover:bg-gray-50" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className={`text-center text-sm font-semibold px-4 py-3 rounded-lg transition-colors ${a.bg}`}>
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
