"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calcularRecibo, TASAS_DEFAULT } from "@/lib/calcular-recibo";
import type { CctRates, ReciboCalculado } from "@/lib/calcular-recibo";

const MESES = [
  { v: 1, l: "Enero" }, { v: 2, l: "Febrero" }, { v: 3, l: "Marzo" },
  { v: 4, l: "Abril" }, { v: 5, l: "Mayo" }, { v: 6, l: "Junio" },
  { v: 7, l: "Julio" }, { v: 8, l: "Agosto" }, { v: 9, l: "Septiembre" },
  { v: 10, l: "Octubre" }, { v: 11, l: "Noviembre" }, { v: 12, l: "Diciembre" },
];

const $ = (n: number) =>
  `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function FilaCalc({ label, val, indent }: { label: string; val: number; indent?: boolean }) {
  return (
    <div className={`flex justify-between py-1 border-b border-gray-100 text-sm ${indent ? "pl-4" : ""}`}>
      <span className="text-[#4A5568]">{label}</span>
      <span className="font-medium text-[#0F1A2E]">{$(val)}</span>
    </div>
  );
}

type EmpleadoBasic = {
  id: string;
  remuneracionAsignada: number | null;
  cctRates: CctRates | null;
  seccion: string | null;
  modalidad: string | null;
  obraSocialNombre: string | null;
  lugaryFecha: string | null;
};

export default function ReciboForm({ empleado }: { empleado: EmpleadoBasic }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rates: CctRates = empleado.cctRates ?? TASAS_DEFAULT;

  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [km, setKm] = useState<string>("");
  const [dias, setDias] = useState<string>(String(rates.diasHabilesMes));

  const calc = useMemo<ReciboCalculado | null>(() => {
    const kmN = Number(km);
    const diasN = Number(dias);
    if (!kmN || !diasN) return null;
    return calcularRecibo(kmN, diasN, rates);
  }, [km, dias, rates]);

  // Período en texto: mes del trabajo = mes anterior al de pago
  const mesTextoLabel = MESES.find((m) => m.v === mes)?.l ?? "";
  const periodoDisplay = `${mesTextoLabel} ${anio}`;
  const mesPago = mes === 12 ? 1 : mes + 1;
  const anioPago = mes === 12 ? anio + 1 : anio;
  const periodoPago = `${MESES.find((m) => m.v === mesPago)?.l} ${anioPago}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!calc) return;
    setLoading(true);
    setError("");

    const data = {
      periodoDisplay,
      seccion: empleado.seccion ?? "",
      modalidad: empleado.modalidad ?? "",
      obraSocialNombre: empleado.obraSocialNombre ?? "",
      lugaryFecha: empleado.lugaryFecha ?? "",
      periodoPago,
      remuneracionAsignada: empleado.remuneracionAsignada ?? 0,
      sueldoBruto: calc.sueldoBruto,
      roiSa: calc.roiSa,
      ctb: {
        jubilacion: calc.ctbJubilacion,
        ley19032: calc.ctbLey19032,
        asigFamiliares: calc.ctbAsigFamiliares,
        fondoEmpleo: calc.ctbFondoEmpleo,
        obraSocial: calc.ctbObraSocial,
        artPorcentual: calc.ctbArtPorcentual,
        artSumaFija: calc.ctbArtSumaFija,
        costoCCT: calc.ctbCostoCCT,
        seguroVida: calc.ctbSeguroVida,
      },
      rem: {
        diasSueldo: calc.diasSueldo,
        montoSueldo: calc.montoSueldo,
        montoPresentismo: calc.montoPresentismo,
        baseKmRecorrido: calc.baseKmRecorrido,
        montoKmRecorrido: calc.montoKmRecorrido,
      },
      noRem: {
        baseViaticosKm: calc.baseDietas,
        montoViaticosKm: calc.montoViaticosKm,
        baseViaticoEspecial: calc.basePernoctadas,
        montoViaticoEspecial: calc.montoViaticoEspecial,
        montoComida: calc.montoComida,
        montoRedondeo: calc.montoAdicionalNoRem,
      },
      desc: {
        jubilacion: calc.descJubilacion,
        ley19032: calc.descLey19032,
        obraSocial: calc.descObraSocial,
        cuotaSindical: calc.descCuotaSindical,
        seguroSepelio: calc.descSeguroSepelio,
      },
      totalRem: calc.totalRem,
      totalNoRem: calc.totalNoRem,
      totalDesc: calc.totalDesc,
      sueldoNeto: calc.sueldoNeto,
    };

    try {
      const res = await fetch(`/api/empleados/${empleado.id}/recibos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodoAnio: anio, periodoMes: mes, data }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Error al guardar");
      }
      router.push(`/admin/empleados/${empleado.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

      {/* ── Período ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#0F1A2E] mb-4">Período liquidado</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Año</label>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              {[2024, 2025, 2026, 2027].map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            >
              {MESES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-[#4A5568] mt-2">
          Período: <strong>{periodoDisplay}</strong> · Pago: <strong>{periodoPago}</strong>
        </p>
      </div>

      {/* ── Datos de viaje ── */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-semibold text-[#0F1A2E] mb-4">Datos del período</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">KM recorridos *</label>
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="510"
              required
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#4A5568] uppercase tracking-wider mb-1">Días trabajados</label>
            <input
              type="number"
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              placeholder="25"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
            />
            <p className="text-xs text-[#4A5568] mt-1">Default: {rates.diasHabilesMes} días hábiles</p>
          </div>
        </div>
      </div>

      {/* ── Preview calculado ── */}
      {calc && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-[#0F1A2E]">Liquidación calculada</h2>

          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-1">Remunerativos</p>
            <FilaCalc label={`0301 Sueldo (${calc.diasSueldo} días)`} val={calc.montoSueldo} />
            <FilaCalc label="0305 Presentismo" val={calc.montoPresentismo} />
            <FilaCalc label={`0323 KM Recorrido (${calc.baseKmRecorrido} km)`} val={calc.montoKmRecorrido} />
            <FilaCalc label="Total remunerativo" val={calc.totalRem} />
          </div>

          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-1">No remunerativos</p>
            <FilaCalc label={`0395 Viáticos por KM (${calc.baseDietas} días fuera)`} val={calc.montoViaticosKm} />
            <FilaCalc label={`0401 Viático especial (${calc.basePernoctadas} noches)`} val={calc.montoViaticoEspecial} />
            <FilaCalc label="0402 Comida" val={calc.montoComida} />
            <FilaCalc label="9999 Adicional no rem" val={calc.montoAdicionalNoRem} />
            <FilaCalc label="Total no remunerativo" val={calc.totalNoRem} />
          </div>

          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-1">Descuentos trabajador</p>
            <FilaCalc label="4010 Jubilación (11%)" val={calc.descJubilacion} indent />
            <FilaCalc label="4020 Ley 19032 (3%)" val={calc.descLey19032} indent />
            <FilaCalc label="4051 Obra Social (3%)" val={calc.descObraSocial} indent />
            <FilaCalc label="4210 Cuota Sindical (1.5%)" val={calc.descCuotaSindical} indent />
            <FilaCalc label="4211 Seguro y Sepelio (3%)" val={calc.descSeguroSepelio} indent />
            <FilaCalc label="Total descuentos" val={calc.totalDesc} />
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[#4A5568]">Sueldo Bruto</span>
              <span className="font-medium">{$(calc.sueldoBruto)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[#0F1A2E]">SUELDO NETO</span>
              <span className="font-bold text-lg text-[#0F1A2E]">{$(calc.sueldoNeto)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#4A5568]">ROI SA (costo total empleador)</span>
              <span className="font-medium text-[#C9A84C]">{$(calc.roiSa)}</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !calc}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar recibo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-gray-200 text-[#4A5568] px-5 py-2.5 rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
