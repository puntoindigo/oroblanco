"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/presupuestos", label: "Presupuestos", icon: "📋" },
  { href: "/admin/viajes", label: "Viajes", icon: "🚛" },
  { href: "/admin/viajes/nuevo", label: "Nuevo viaje", icon: "➕" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥" },
];

const ACCOUNTS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_ACCOUNTS_URL ?? "https://accounts.puntoindigo.com")
    : "https://accounts.puntoindigo.com";

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

  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const logoutUrl = `${ACCOUNTS_URL}/api/auth/logout?next=${encodeURIComponent(appUrl + "/admin/login")}`;

  return (
    <aside className="w-56 shrink-0 bg-[#0F1A2E] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E] text-xs">
            OB
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">ORO BLANCO</div>
            <div className="text-[#C9A84C] text-[9px] tracking-widest uppercase leading-none">
              Admin
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href) && href !== "/admin";
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors ${
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

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {userEmail && (
          <div className="flex items-center gap-2 px-3 py-1">
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
        <a
          href={logoutUrl}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <span>🚪</span> Cerrar sesión
        </a>
      </div>
    </aside>
  );
}
