import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [totalPresupuestos, nuevos, totalViajes, enCurso] = await Promise.all([
    prisma.presupuesto.count(),
    prisma.presupuesto.count({ where: { estado: "NUEVO" } }),
    prisma.viaje.count(),
    prisma.viaje.count({ where: { estado: "EN_CURSO" } }),
  ]);
  return { totalPresupuestos, nuevos, totalViajes, enCurso };
}

export default async function AdminHome() {
  const stats = await getStats();

  const cards = [
    {
      label: "Presupuestos nuevos",
      value: stats.nuevos,
      total: `${stats.totalPresupuestos} en total`,
      icon: "📋",
      href: "/admin/presupuestos",
      highlight: stats.nuevos > 0,
    },
    {
      label: "Viajes en curso",
      value: stats.enCurso,
      total: `${stats.totalViajes} registrados`,
      icon: "🚛",
      href: "/admin/viajes",
      highlight: false,
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Dashboard</h1>
        <p className="text-[#4A5568] text-sm mt-1">Resumen de operaciones</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`block bg-white rounded-xl p-5 border transition-all hover:shadow-md ${
              c.highlight ? "border-[#C9A84C] shadow-sm" : "border-gray-100"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              {c.highlight && (
                <span className="bg-[#C9A84C] text-[#0F1A2E] text-xs font-bold px-2 py-0.5 rounded-full">
                  Nuevo
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-[#0F1A2E] mb-0.5">{c.value}</div>
            <div className="text-sm font-medium text-[#1E3A5F]">{c.label}</div>
            <div className="text-xs text-[#4A5568] mt-0.5">{c.total}</div>
          </Link>
        ))}

        <Link
          href="/admin/viajes/nuevo"
          className="block bg-[#1E3A5F] rounded-xl p-5 border border-[#1E3A5F] hover:bg-[#0F1A2E] transition-colors"
        >
          <div className="text-2xl mb-3">➕</div>
          <div className="text-white font-semibold text-sm">Registrar viaje</div>
          <div className="text-white/60 text-xs mt-0.5">Alta rápida</div>
        </Link>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#0F1A2E] text-sm mb-3">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/presupuestos"
            className="text-xs bg-[#F8F8F4] border border-gray-200 text-[#1E3A5F] px-3 py-1.5 rounded hover:bg-[#C9A84C]/10 transition-colors"
          >
            Ver todos los presupuestos →
          </Link>
          <Link
            href="/admin/viajes"
            className="text-xs bg-[#F8F8F4] border border-gray-200 text-[#1E3A5F] px-3 py-1.5 rounded hover:bg-[#C9A84C]/10 transition-colors"
          >
            Ver todos los viajes →
          </Link>
        </div>
      </div>
    </div>
  );
}
