"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MESES = [
  { v: 1, l: "Enero" }, { v: 2, l: "Febrero" }, { v: 3, l: "Marzo" },
  { v: 4, l: "Abril" }, { v: 5, l: "Mayo" }, { v: 6, l: "Junio" },
  { v: 7, l: "Julio" }, { v: 8, l: "Agosto" }, { v: 9, l: "Septiembre" },
  { v: 10, l: "Octubre" }, { v: 11, l: "Noviembre" }, { v: 12, l: "Diciembre" },
];

const AÑOS = [2024, 2025, 2026, 2027];

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="bg-[#0F1A2E] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-t">
        {titulo}
      </div>
      <div className="border border-gray-200 border-t-0 rounded-b p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function Campo({
  label, name, type = "number", placeholder, span, required,
}: {
  label: string; name: string; type?: string; placeholder?: string; span?: number; required?: boolean;
}) {
  return (
    <div className={span === 2 ? "col-span-2" : span === 4 ? "col-span-4 sm:col-span-4" : ""}>
      <label className="block text-[#4A5568] text-xs font-medium uppercase tracking-wider mb-1">
        {label}{required && " *"}
      </label>
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        placeholder={placeholder}
        required={required}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
      />
    </div>
  );
}

export default function ReciboForm({ empleadoId }: { empleadoId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const g = (k: string) => Number(fd.get(k) || 0);
    const s = (k: string) => String(fd.get(k) || "");

    const periodoAnio = Number(fd.get("periodoAnio"));
    const periodoMes = Number(fd.get("periodoMes"));

    const data = {
      periodoDisplay: s("periodoDisplay"),
      seccion: s("seccion"),
      modalidad: s("modalidad"),
      fechaReconocida: s("fechaReconocida"),
      obraSocialNombre: s("obraSocialNombre"),
      lugaryFecha: s("lugaryFecha"),
      periodoPago: s("periodoPago"),
      remuneracionAsignada: g("remuneracionAsignada"),
      sueldoBruto: g("sueldoBruto"),
      roiSa: g("roiSa"),
      ctb: {
        jubilacion: g("ctb_jubilacion"),
        ley19032: g("ctb_ley19032"),
        asigFamiliares: g("ctb_asigFamiliares"),
        fondoEmpleo: g("ctb_fondoEmpleo"),
        obraSocial: g("ctb_obraSocial"),
        artPorcentual: g("ctb_artPorcentual"),
        artSumaFija: g("ctb_artSumaFija"),
        seguroVida: g("ctb_seguroVida"),
        costoCCT: g("ctb_costoCCT"),
      },
      rem: {
        diasSueldo: g("rem_diasSueldo"),
        montoSueldo: g("rem_montoSueldo"),
        montoPresentismo: g("rem_montoPresentismo"),
        baseKmRecorrido: g("rem_baseKmRecorrido"),
        montoKmRecorrido: g("rem_montoKmRecorrido"),
      },
      noRem: {
        baseViaticosKm: g("noRem_baseViaticosKm"),
        montoViaticosKm: g("noRem_montoViaticosKm"),
        baseViaticoEspecial: g("noRem_baseViaticoEspecial"),
        montoViaticoEspecial: g("noRem_montoViaticoEspecial"),
        montoComida: g("noRem_montoComida"),
        montoRedondeo: g("noRem_montoRedondeo"),
      },
      desc: {
        jubilacion: g("desc_jubilacion"),
        ley19032: g("desc_ley19032"),
        obraSocial: g("desc_obraSocial"),
        cuotaSindical: g("desc_cuotaSindical"),
        seguroSepelio: g("desc_seguroSepelio"),
      },
      totalRem:
        g("rem_montoSueldo") + g("rem_montoPresentismo") + g("rem_montoKmRecorrido"),
      totalNoRem:
        g("noRem_montoViaticosKm") + g("noRem_montoViaticoEspecial") +
        g("noRem_montoComida") + g("noRem_montoRedondeo"),
      totalDesc:
        g("desc_jubilacion") + g("desc_ley19032") + g("desc_obraSocial") +
        g("desc_cuotaSindical") + g("desc_seguroSepelio"),
      sueldoNeto: g("sueldoNeto"),
    };

    try {
      const res = await fetch(`/api/empleados/${empleadoId}/recibos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodoAnio, periodoMes, data }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error ?? "Error al guardar");
      }
      router.push(`/admin/empleados/${empleadoId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">

      {/* ── Período ── */}
      <Seccion titulo="Período">
        <div>
          <label className="block text-[#4A5568] text-xs font-medium uppercase tracking-wider mb-1">Año *</label>
          <select name="periodoAnio" required className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]">
            {AÑOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[#4A5568] text-xs font-medium uppercase tracking-wider mb-1">Mes *</label>
          <select name="periodoMes" required className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]">
            {MESES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
          </select>
        </div>
        <Campo label="Período (texto en recibo)" name="periodoDisplay" type="text" placeholder="Agosto 2026" span={2} required />
        <Campo label="Lugar y Fecha de Pago" name="lugaryFecha" type="text" placeholder="Rosario" span={2} />
        <Campo label="Período de Pago" name="periodoPago" type="text" placeholder="Septiembre 2026" span={2} />
        <Campo label="Sección" name="seccion" type="text" placeholder="Administración" span={2} />
        <Campo label="Modalidad" name="modalidad" type="text" placeholder="A tiempo completo Indeterminado (Trabajo permanente)" span={4} />
        <Campo label="Fecha Reconocida" name="fechaReconocida" type="text" placeholder="08/09/2026" span={2} />
        <Campo label="Obra Social" name="obraSocialNombre" type="text" placeholder="OSECAC" span={2} />
      </Seccion>

      {/* ── Remuneración ── */}
      <Seccion titulo="Remuneración">
        <Campo label="Remuneración Asignada" name="remuneracionAsignada" required />
        <Campo label="Sueldo Bruto" name="sueldoBruto" required />
        <Campo label="Sueldo Neto" name="sueldoNeto" required />
        <Campo label="ROI SA" name="roiSa" />
      </Seccion>

      {/* ── Contribuciones empleador ── */}
      <Seccion titulo="Contribuciones Empleador">
        <Campo label="5010 · Jubilación" name="ctb_jubilacion" />
        <Campo label="5020 · Ley 19032" name="ctb_ley19032" />
        <Campo label="5030 · Asig. Familiares" name="ctb_asigFamiliares" />
        <Campo label="5040 · Fondo de Empleo" name="ctb_fondoEmpleo" />
        <Campo label="5050 · Obra Social" name="ctb_obraSocial" />
        <Campo label="5060 · ART Porcentual" name="ctb_artPorcentual" />
        <Campo label="5250 · ART Suma Fija" name="ctb_artSumaFija" />
        <Campo label="5361 · Seguro de Vida" name="ctb_seguroVida" />
        <Campo label="Costo Derivado CCT" name="ctb_costoCCT" />
      </Seccion>

      {/* ── Conceptos Remunerativos ── */}
      <Seccion titulo="Conceptos Remunerativos">
        <Campo label="0301 · Días Sueldo" name="rem_diasSueldo" />
        <Campo label="0301 · Monto Sueldo" name="rem_montoSueldo" required />
        <Campo label="0305 · Presentismo" name="rem_montoPresentismo" />
        <Campo label="0323 · Base KM Recorrido" name="rem_baseKmRecorrido" />
        <Campo label="0323 · Monto KM Recorrido" name="rem_montoKmRecorrido" />
      </Seccion>

      {/* ── Conceptos No Remunerativos ── */}
      <Seccion titulo="Conceptos No Remunerativos">
        <Campo label="0395 · Base Viáticos KM" name="noRem_baseViaticosKm" />
        <Campo label="0395 · Monto Viáticos KM" name="noRem_montoViaticosKm" />
        <Campo label="0401 · Base Viático Especial" name="noRem_baseViaticoEspecial" />
        <Campo label="0401 · Monto Viático Especial" name="noRem_montoViaticoEspecial" />
        <Campo label="0402 · Comida" name="noRem_montoComida" />
        <Campo label="9999 · Redondeo" name="noRem_montoRedondeo" />
      </Seccion>

      {/* ── Descuentos ── */}
      <Seccion titulo="Descuentos">
        <Campo label="4010 · Jubilación" name="desc_jubilacion" />
        <Campo label="4020 · Ley 19032" name="desc_ley19032" />
        <Campo label="4051 · Obra Social" name="desc_obraSocial" />
        <Campo label="4210 · Cuota Sindical" name="desc_cuotaSindical" />
        <Campo label="4211 · Seguro y Sepelio" name="desc_seguroSepelio" />
      </Seccion>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
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
