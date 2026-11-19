"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Panel de control",
  viajes: "Viajes",
  vehiculos: "Vehículos",
  gastos: "Gastos",
  facturas: "Facturas",
  usuarios: "Usuarios",
  nuevo: "Nuevo viaje",
};

function segmentLabel(seg: string, prev?: string): string {
  if (LABELS[seg]) return LABELS[seg];
  // IDs de viaje (cuid/uuid) → "Editar viaje"
  if (prev === "viajes") return "Editar viaje";
  return seg;
}

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["admin", "viajes", "abc123"]

  if (segments.length <= 1) return null; // en /admin no hace falta

  const crumbs = segments.map((seg, i) => ({
    label: segmentLabel(seg, segments[i - 1]),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1.5 px-6 pt-4 pb-1 text-xs text-[#4A5568]">
      <Link href="/admin" className="hover:text-[#1E3A5F] transition-colors">
        🏠
      </Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-gray-300">/</span>
          {c.isLast ? (
            <span className="text-[#0F1A2E] font-medium">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-[#1E3A5F] transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
