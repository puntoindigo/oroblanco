"use client";

import { useState, useEffect, useRef } from "react";

type Factura = {
  id: string; movimiento: string; tipo: string; puntoVenta: string; numero: string;
  fecha: string; cuit: string; razonSocial: string; montoNeto: number; iva: number; total: number;
  viajeId: string | null;
  viaje: { id: string; origen: string; destino: string; cliente: string } | null;
};

type ViajeOpt = { id: string; label: string };

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [viajes, setViajes] = useState<ViajeOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [movimiento, setMovimiento] = useState("emitida");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [showImport, setShowImport] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Cargar viajes una sola vez (opciones para el selector)
  useEffect(() => {
    fetch("/api/viajes")
      .then((r) => r.json())
      .then((data: Array<{ id: string; cliente: string; origen: string; destino: string; fecha: string | null }>) =>
        setViajes(
          data.map((v) => ({
            id: v.id,
            label: `${v.cliente} · ${v.origen} → ${v.destino}${v.fecha ? " · " + new Date(v.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" }) : ""}`,
          }))
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ movimiento });
    if (mes) params.set("mes", mes);
    fetch(`/api/facturas?${params}`)
      .then((r) => r.json())
      .then(setFacturas)
      .finally(() => setLoading(false));
  }, [mes, movimiento]);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("movimiento", movimiento);
    try {
      const res = await fetch("/api/facturas/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al importar");
      const omitMsg = data.omitidos ? ` · ${data.omitidos} ya existían` : "";
      const errMsg = data.errores?.length ? ` · ${data.errores.length} errores` : "";
      setImportMsg(`✅ ${data.importados} importados${omitMsg}${errMsg}`);
      const params2 = new URLSearchParams({ movimiento });
      if (mes) params2.set("mes", mes);
      fetch(`/api/facturas?${params2}`).then((r) => r.json()).then(setFacturas);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: unknown) {
      setImportMsg(`❌ ${e instanceof Error ? e.message : "Error al importar"}`);
    } finally {
      setImporting(false);
    }
  }

  async function linkViaje(facturaId: string, viajeId: string) {
    const res = await fetch(`/api/facturas/${facturaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viajeId: viajeId || null }),
    });
    if (!res.ok) return;
    const linked = viajes.find((v) => v.id === viajeId) ?? null;
    setFacturas((prev) =>
      prev.map((f) =>
        f.id === facturaId
          ? {
              ...f,
              viajeId: viajeId || null,
              viaje: linked
                ? {
                    id: linked.id,
                    // Extraer origen/destino/cliente del label
                    cliente: linked.label.split(" · ")[0],
                    origen: linked.label.split(" · ")[1]?.split(" → ")[0] ?? "",
                    destino: linked.label.split(" · ")[1]?.split(" → ")[1]?.split(" · ")[0] ?? "",
                  }
                : null,
            }
          : f
      )
    );
  }

  async function deleteFactura(id: string) {
    if (!confirm("¿Eliminar este comprobante?")) return;
    await fetch(`/api/facturas/${id}`, { method: "DELETE" });
    setFacturas((prev) => prev.filter((f) => f.id !== id));
  }

  const total = facturas.reduce((s, f) => s + f.total, 0);
  const sinViaje = facturas.filter((f) => !f.viajeId).length;
  const exportUrl = `/api/facturas/export?movimiento=${movimiento}${mes ? `&mes=${mes}` : ""}`;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1A2E]">Facturas</h1>
          <p className="text-[#4A5568] text-sm mt-1">
            {facturas.length} comprobantes · Total:{" "}
            <span className="font-semibold text-[#1E3A5F]">${total.toLocaleString("es-AR")}</span>
            {sinViaje > 0 && (
              <span className="ml-2 text-amber-600 font-medium">· {sinViaje} sin viaje vinculado</span>
            )}
          </p>
        </div>
        <a
          href={exportUrl}
          className="text-xs border border-gray-200 bg-white text-[#4A5568] px-3 py-2 rounded hover:bg-gray-50 transition-colors self-start"
        >
          Exportar CSV del mes
        </a>
      </div>

      {/* Filtros + importar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#4A5568] uppercase tracking-wider font-medium">Período</label>
            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className={iCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#4A5568] uppercase tracking-wider font-medium">Movimiento</label>
            <select value={movimiento} onChange={(e) => setMovimiento(e.target.value)} className={iCls}>
              <option value="emitida">Emitidas (ventas)</option>
              <option value="recibida">Recibidas (gastos)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowImport((v) => !v)}
            className="flex items-center gap-2 text-xs text-[#4A5568] hover:text-[#1E3A5F] transition-colors"
          >
            <span className={`transition-transform ${showImport ? "rotate-90" : ""}`}>▶</span>
            Importar CSV de ARCA
            {importMsg && <span className="ml-2">{importMsg}</span>}
          </button>
          {showImport && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-[#4A5568]">
                En ARCA: <strong>Mis Comprobantes → {movimiento === "emitida" ? "Emitidos" : "Recibidos"} → Exportar → Excel</strong>.
                Abrí en Excel / LibreOffice y guardá como <em>CSV separado por punto y coma</em>.
                Los registros ya importados se omiten automáticamente.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.txt"
                  className="text-xs text-[#4A5568] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#F8F8F4] file:text-[#1E3A5F] hover:file:bg-gray-200"
                />
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="text-xs bg-[#1E3A5F] text-white font-semibold px-4 py-2 rounded hover:bg-[#0F1A2E] transition-colors disabled:opacity-60"
                >
                  {importing ? "Importando..." : "Importar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <p className="text-sm text-[#4A5568]">Cargando...</p>
      ) : facturas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-[#4A5568] text-sm">
            Sin comprobantes para el período seleccionado. Importá el CSV de ARCA arriba.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F8F8F4]">
                  {["Fecha", "Tipo", "Número", "CUIT / Razón Social", "Neto", "IVA", "Total", "Viaje vinculado", ""].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[#4A5568] uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturas.map((f) => (
                  <tr key={f.id} className={`border-b border-gray-50 hover:bg-[#F8F8F4] ${!f.viajeId ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3 text-xs text-[#4A5568] whitespace-nowrap">
                      {new Date(f.fecha).toLocaleDateString("es-AR", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#0F1A2E]">{f.tipo}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#4A5568]">
                      {f.puntoVenta}-{f.numero}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-[#0F1A2E] font-medium">{f.razonSocial}</div>
                      <div className="text-xs text-[#4A5568]">{f.cuit}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-[#4A5568]">
                      ${f.montoNeto.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-right text-[#4A5568]">
                      ${f.iva.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F1A2E] text-right whitespace-nowrap">
                      ${f.total.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-2 min-w-[220px]">
                      <select
                        value={f.viajeId ?? ""}
                        onChange={(e) => linkViaje(f.id, e.target.value)}
                        className={`w-full text-xs border rounded px-2 py-1 focus:outline-none focus:border-[#C9A84C] transition-colors ${
                          f.viajeId
                            ? "border-green-200 bg-green-50 text-green-800"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        <option value="">— Sin viaje —</option>
                        {viajes.map((v) => (
                          <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteFactura(f.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const iCls = "border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]";
