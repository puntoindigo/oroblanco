"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

type Cliente = {
  id: string;
  nombre: string;
  empresa: string | null;
  tel: string | null;
  _count: { viajes: number };
  viajes: { precio: number | null }[];
};

export default function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  const listItems = useMemo(
    () => clientes.map((c) => ({ id: c.id, href: `/admin/clientes/${c.id}` })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientes.map((c) => c.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/clientes/nuevo");
  const { activeId } = useAdminKeyboardContext();

  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-[#4A5568]">
        <p className="text-4xl mb-3">👥</p>
        <p className="font-medium">Sin clientes todavía</p>
        <p className="text-sm mt-1">Los clientes se crean desde el formulario de un viaje, o manualmente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F8F8F4] border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Cliente</th>
            <th className="text-left px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
            <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider">Viajes</th>
            <th className="text-right px-4 py-3 text-[#4A5568] font-medium text-xs uppercase tracking-wider hidden md:table-cell">Facturado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {clientes.map((c) => {
            const total = c.viajes.reduce((s, v) => s + (v.precio ?? 0), 0);
            return (
              <tr
                key={c.id}
                className={`transition-colors ${
                  activeId === c.id
                    ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3">
                  <Link href={`/admin/clientes/${c.id}`} className="font-medium text-[#0F1A2E] hover:text-[#1E3A5F]">
                    {c.nombre}
                  </Link>
                  {c.empresa && <p className="text-xs text-[#4A5568]">{c.empresa}</p>}
                </td>
                <td className="px-4 py-3 text-[#4A5568] hidden sm:table-cell">{c.tel ?? "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-[#0F1A2E]">{c._count.viajes}</td>
                <td className="px-4 py-3 text-right text-[#4A5568] hidden md:table-cell">
                  {total > 0
                    ? `$${total.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/clientes/${c.id}`} className="text-xs text-[#1E3A5F] hover:underline">
                    Ver →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
