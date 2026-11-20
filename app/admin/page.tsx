import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FacturacionChart from "@/components/admin/facturacion-chart";

export const dynamic = "force-dynamic";

const MESES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

async function getStats() {
  const [presupuestos, totalClientes, totalViajes, facturas] = await Promise.all([
    prisma.viaje.count({ where: { estado: "PRESUPUESTO" } }),
    prisma.cliente.count(),
    prisma.viaje.count(),
    prisma.factura.findMany({
      where: { movimiento: "emitida" },
      select: { fecha: true, total: true },
      orderBy: { fecha: "asc" },
    }),
  ]);

  const totalMes = await prisma.factura.aggregate({
    _sum: { total: true },
    where: {
      movimiento: "emitida",
      fecha: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });

  const byMonth: Record<string, number> = {};
  for (const f of facturas) {
    const key = `${f.fecha.getFullYear()}-${String(f.fecha.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = (byMonth[key] ?? 0) + f.total;
  }
  const chartData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({
      key,
      label: MESES_ES[parseInt(key.slice(5, 7)) - 1],
      total,
    }));

  return { presupuestos, totalClientes, totalViajes, totalMes: totalMes._sum.total ?? 0, chartData };
}

export default async function PanelControl() {
  const stats = await getStats();

  const cards = [
    {
      label: "Clientes",
      value: stats.totalClientes,
      sub: "Ver cartera completa",
      icon: "👤",
      href: "/admin/clientes",
      color: "border-blue-200",
    },
    {
      label: "Viajes registrados",
      value: stats.totalViajes,
      sub: "Historial completo",
      icon: "🚛",
      href: "/admin/viajes",
      color: "border-gray-200",
    },
    {
      label: "Facturado este mes",
      value: `$${stats.totalMes.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`,
      sub: "Facturas emitidas",
      icon: "💰",
      href: "/admin/facturas",
      color: "border-green-200",
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Panel de control</h1>
        <p className="text-[#4A5568] text-sm mt-1">Resumen operativo</p>
      </div>

      {/* Alerta presupuestos — solo si hay pendientes */}
      {stats.presupuestos > 0 && (
        <Link
          href="/admin/viajes"
          className="flex items-center gap-3 bg-[#FDF8EC] border border-[#C9A84C] rounded-xl px-5 py-3.5 mb-5 hover:bg-[#FDF3D6] transition-colors"
        >
          <span className="text-xl">📋</span>
          <div className="flex-1">
            <span className="font-semibold text-[#0F1A2E] text-sm">
              {stats.presupuestos} presupuesto{stats.presupuestos !== 1 ? "s" : ""} sin confirmar
            </span>
            <span className="text-xs text-[#4A5568] ml-2">→ Ver viajes</span>
          </div>
          <span className="bg-[#C9A84C] text-[#0F1A2E] text-xs font-bold px-2 py-0.5 rounded-full">Atención</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`block bg-white rounded-xl p-5 border ${c.color} transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
            </div>
            <div className="text-3xl font-bold text-[#0F1A2E] mb-0.5">{c.value}</div>
            <div className="text-sm font-medium text-[#1E3A5F]">{c.label}</div>
            <div className="text-xs text-[#4A5568] mt-0.5">{c.sub}</div>
          </Link>
        ))}
      </div>

      {/* Gráfico de facturación — colapsado por defecto */}
      <details className="group bg-white rounded-xl border border-gray-100 mb-6">
        <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#0F1A2E]">Facturación por mes</span>
            <span className="text-xs text-[#4A5568]">— desde el inicio</span>
          </div>
          <span className="text-[#4A5568] text-xs group-open:rotate-180 transition-transform duration-200 inline-block">▼</span>
        </summary>
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="pt-4">
            <FacturacionChart data={stats.chartData} />
          </div>
          <div className="mt-3 text-right">
            <Link href="/admin/facturas" className="text-xs text-[#1E3A5F] hover:underline">
              Ver todas las facturas →
            </Link>
          </div>
        </div>
      </details>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/viajes/nuevo", label: "+ Nuevo viaje", bg: "bg-[#1E3A5F] text-white hover:bg-[#0F1A2E]" },
          { href: "/admin/clientes", label: "👤 Clientes", bg: "bg-white border border-gray-200 text-[#1E3A5F] hover:bg-gray-50" },
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
