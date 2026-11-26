"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useKeyboardList } from "@/lib/hooks/useKeyboardList";
import { useAdminKeyboardContext } from "@/lib/hooks/useAdminKeyboard";

type PagoFacturaItem = {
  factura: { numero: string; total: number; estado: string };
};

type Pago = {
  id: string;
  nroCheque: string | null;
  tipo: string;
  monto: number;
  fechaAcreditacion: string | null;
  emisorNombre: string | null;
  emisorCuit: string | null;
  facturas: PagoFacturaItem[];
};

function formatARS(n: number) {
  return "$" + n.toLocaleString("es-AR");
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [factInput, setFactInput] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/pagos")
      .then((r) => r.json())
      .then(setPagos)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const listItems = useMemo(
    () => pagos.map((p) => ({ id: p.id, href: "/admin/pagos" })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagos.map((p) => p.id).join(",")]
  );
  useKeyboardList(listItems, "/admin/pagos");
  const { activeId } = useAdminKeyboardContext();

  const total = pagos.reduce((s, p) => s + p.monto, 0);
  const hoy = new Date();
  const pendientes = pagos.filter((p) => p.fechaAcreditacion && new Date(p.fechaAcreditacion) > hoy);

  function toggleAll() {
    if (selected.size === pagos.length) setSelected(new Set());
    else setSelected(new Set(pagos.map((p) => p.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function vincular() {
    const nums = factInput.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (nums.length === 0) { setLinkMsg({ ok: false, text: "Ingresá al menos un número de factura" }); return; }
    if (selected.size === 0) { setLinkMsg({ ok: false, text: "Seleccioná al menos un cheque" }); return; }
    setLinking(true);
    setLinkMsg(null);
    try {
      const res = await fetch("/api/pagos/vincular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagoIds: Array.from(selected), facturaNumeros: nums }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const aviso = data.noEncontradas?.length
        ? ` (no encontradas: ${data.noEncontradas.join(", ")} — importar ARCA primero)`
        : "";
      setLinkMsg({ ok: true, text: `Vinculados a ${data.facturas.join(", ")}${aviso}` });
      setSelected(new Set());
      setFactInput("");
      load();
    } catch (e: unknown) {
      setLinkMsg({ ok: false, text: e instanceof Error ? e.message : "Error" });
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Pagos / Cheques</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {pagos.length} registros · Total{" "}
            <span className="font-semibold text-[#1E3A5F]">{formatARS(total)}</span>
            {pendientes.length > 0 && (
              <> · <span className="text-amber-700">{pendientes.length} por acreditar</span></>
            )}
          </p>
        </div>
      </div>

      {/* Panel vincular */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-[#4A5568] mb-1">
            Vincular seleccionados a facturas (números separados por coma)
          </label>
          <input
            value={factInput}
            onChange={(e) => setFactInput(e.target.value)}
            placeholder="164, 165, 166"
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
          />
        </div>
        <button
          onClick={vincular}
          disabled={linking || selected.size === 0}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-5 py-2 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {linking ? "Vinculando..." : `Vincular ${selected.size > 0 ? `(${selected.size})` : ""}`}
        </button>
      </div>
      {linkMsg && (
        <p className={`text-sm mb-4 ${linkMsg.ok ? "text-green-700" : "text-red-600"}`}>
          {linkMsg.ok ? "✔ " : "✗ "}{linkMsg.text}
        </p>
      )}

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-[#4A5568]">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === pagos.length && pagos.length > 0}
                      onChange={toggleAll}
                      className="accent-[#C9A84C]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Cheque</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Emisor</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Monto</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Acreditación</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Facturas</th>
                  <th className="px-4 py-3 text-left font-semibold text-[#4A5568]">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagos.map((pago) => {
                  const acreditado = pago.fechaAcreditacion ? new Date(pago.fechaAcreditacion) <= hoy : null;
                  return (
                    <tr
                      key={pago.id}
                      onClick={() => toggle(pago.id)}
                      className={`cursor-pointer transition-colors ${
                        activeId === pago.id
                          ? "bg-[#C9A84C]/10 outline outline-1 outline-[#C9A84C]/40"
                          : selected.has(pago.id) ? "bg-amber-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(pago.id)}
                          onChange={() => toggle(pago.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-[#C9A84C]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-[#1E3A5F]">
                          {pago.nroCheque ?? "—"}
                        </span>
                        {pago.tipo === "cheque_cpd" && (
                          <span className="ml-2 text-[9px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            CPD
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5568]">
                        {pago.emisorNombre ?? pago.emisorCuit ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0F1A2E]">
                        {formatARS(pago.monto)}
                      </td>
                      <td className="px-4 py-3 text-[#4A5568]">
                        {pago.fechaAcreditacion
                          ? new Date(pago.fechaAcreditacion).toLocaleDateString("es-AR", { timeZone: "UTC" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#4A5568]">
                        {pago.facturas.length > 0
                          ? pago.facturas.map((pf) => `FAC ${pf.factura.numero}`).join(", ")
                          : <span className="text-gray-400 italic">Sin vincular</span>}
                      </td>
                      <td className="px-4 py-3">
                        {acreditado === null ? (
                          <span className="text-xs text-gray-400">—</span>
                        ) : acreditado ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Acreditado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {pagos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#4A5568]">
                      No hay pagos registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
