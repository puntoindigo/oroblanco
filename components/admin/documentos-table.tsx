"use client";

import { useMemo } from "react";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

const TIPO_LABEL: Record<string, string> = {
  seguro_vehiculo: "Seguro Vehículo",
  recibo_sueldo: "Recibo Sueldo",
  gasto_combustible: "Combustible",
  comprobante_pago: "Comprobante Pago",
  otro: "Otro",
};

const TIPO_COLOR: Record<string, string> = {
  seguro_vehiculo: "bg-blue-100 text-blue-800",
  recibo_sueldo: "bg-purple-100 text-purple-800",
  gasto_combustible: "bg-orange-100 text-orange-800",
  comprobante_pago: "bg-green-100 text-green-800",
  otro: "bg-gray-100 text-gray-700",
};

type Documento = {
  id: string;
  nombre: string;
  tipo: string;
  fecha: string | null;
  monto: number | null;
  url: string | null;
  empleado: { nombre: string; apellido: string | null } | null;
  vehiculo: { patente: string; modelo: string } | null;
};

export default function DocumentosTable({ documentos }: { documentos: Documento[] }) {
  const listItems = useMemo(
    () => documentos.map((d) => ({ id: d.id, href: "/admin/documentos" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [documentos.map((d) => d.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/documentos");
  const { activeId } = useAdminKeyboardContext();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Tipo</th>
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden sm:table-cell">Vinculado a</th>
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568] hidden md:table-cell">Monto</th>
            <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Archivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {documentos.map((doc) => (
            <tr
              key={doc.id}
              className={`transition-colors ${
                activeId === doc.id
                  ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="px-4 py-3 font-medium text-[#0F1A2E]">{doc.nombre}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    TIPO_COLOR[doc.tipo] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {TIPO_LABEL[doc.tipo] ?? doc.tipo}
                </span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-xs text-[#4A5568]">
                {doc.empleado
                  ? `${doc.empleado.apellido ?? ""} ${doc.empleado.nombre}`
                  : doc.vehiculo
                  ? `${doc.vehiculo.patente} · ${doc.vehiculo.modelo}`
                  : "—"}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                {doc.fecha ? new Date(doc.fecha).toLocaleDateString("es-AR") : "—"}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-[#4A5568]">
                {doc.monto != null ? `$${doc.monto.toLocaleString("es-AR")}` : "—"}
              </td>
              <td className="px-4 py-3">
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1E3A5F] hover:underline"
                  >
                    Ver
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sin archivo</span>
                )}
              </td>
            </tr>
          ))}
          {documentos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-[#4A5568]">
                No hay documentos registrados aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
