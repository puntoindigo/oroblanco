"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Panel de control", icon: "📊" },
  { href: "/admin/viajes", label: "Viajes", icon: "🚛" },
  { href: "/admin/vehiculos", label: "Vehículos", icon: "🚐" },
  { href: "/admin/gastos", label: "Gastos", icon: "💸" },
  { href: "/admin/facturas", label: "Facturas", icon: "🧾" },
  { href: "/admin/clientes", label: "Clientes", icon: "👤" },
  { href: "/admin/empleados", label: "Empleados", icon: "👷" },
  { href: "/admin/pagos", label: "Pagos / Cheques", icon: "💳" },
  { href: "/admin/documentos", label: "Documentos", icon: "📂" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
];

export default function AdminSidebar({
  userEmail,
  userName,
  userPicture,
}: {
  userEmail?: string;
  userName?: string;
  userPicture?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const logoutUrl = "/api/auth/logout";

  const currentPage = NAV.find(({ href }) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
  );

  const SidebarContent = () => (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E] text-xs">OB</div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">ORO BLANCO</div>
            <div className="text-[#C9A84C] text-[9px] tracking-widest uppercase leading-none">Admin</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-sm transition-colors ${
                active
                  ? "bg-[#C9A84C] text-[#0F1A2E] font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {userEmail && (
          <div className="flex items-center gap-2 px-3 py-2">
            {userPicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={userPicture} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0F1A2E] text-xs font-bold">
                {(userName ?? userEmail)[0].toUpperCase()}
              </div>
            )}
            <span className="text-white/50 text-xs truncate">{userName ?? userEmail}</span>
          </div>
        )}
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <span>🌐</span> Ver sitio
        </Link>
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <span>🚪</span> Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#0F1A2E] border-b border-white/10 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E] text-xs">OB</div>
          <div className="text-white font-bold text-sm">ORO BLANCO</div>
        </Link>
        <div className="flex items-center gap-3">
          {currentPage && (
            <span className="text-white/50 text-xs">{currentPage.label}</span>
          )}
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/80 p-1.5 hover:text-white"
            aria-label="Abrir menú"
          >
            <div className="w-5 flex flex-col gap-1">
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
              <span className="block h-0.5 bg-current" />
            </div>
          </button>
        </div>
      </div>

      {/* ── Modal confirmación logout ── */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmLogout(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-xs text-center">
            <div className="text-3xl mb-3">🚪</div>
            <h3 className="text-[#0F1A2E] font-bold text-base mb-1">¿Cerrar sesión?</h3>
            <p className="text-[#4A5568] text-sm mb-5">Vas a salir del panel de administración.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 border border-gray-200 text-[#4A5568] py-2 rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <a
                href={logoutUrl}
                className="flex-1 bg-[#0F1A2E] text-white py-2 rounded text-sm font-semibold hover:bg-[#1E3A5F] transition-colors"
              >
                Salir
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar drawer ── */}
      {/* Mobile: fixed slide-in; desktop: static */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1A2E] flex flex-col
          transition-transform duration-200 ease-in-out
          md:static md:w-56 md:z-auto md:translate-x-0 md:flex
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
