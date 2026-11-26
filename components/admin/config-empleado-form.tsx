"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TASAS_DEFAULT } from "@/lib/calcular-recibo";
import type { CctRates } from "@/lib/calcular-recibo";

type InitialConfig = {
  remuneracionAsignada: number | null;
  seccion: string;
  modalidad: string;
  obraSocialNombre: string;
  lugaryFecha: string;
  cctRates: CctRates | null;
};

export default function ConfigEmpleadoForm({
  empleadoId,
  initial,
}: {
  empleadoId: string;
  initial: InitialConfig;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const r = initial.cctRates ?? TASAS_DEFAULT;

  const [fields, setFields] = useState({
    remuneracionAsignada: initial.remuneracionAsignada?.toString() ?? "",
    seccion: initial.seccion,
    modalidad: initial.modalidad,
    obraSocialNombre: initial.obraSocialNombre,
    lugaryFecha: initial.lugaryFecha,
    // Tasas
    sueldoDiario: r.sueldoDiario.toString(),
    diasHabilesMes: r.diasHabilesMes.toString(),
    presentismo: r.presentismo.toString(),
    kmRate0323: r.kmRate0323.toString(),
    dietasKm: r.dietasKm.toString(),
    diaViaticoRate0395: r.diaViaticoRate0395.toString(),
    homeNights: r.homeNights.toString(),
    nocheViaticoRate0401: r.nocheViaticoRate0401.toString(),
    comidaMonto: r.comidaMonto.toString(),
    adicionalNoRem: r.adicionalNoRem.toString(),
    artSumaFija: r.artSumaFija.toString(),
    costoCCT: r.costoCCT.toString(),
    seguroVida: r.seguroVida.toString(),
    pctCtbJubilacion: r.pctCtbJubilacion.toString(),
    pctCtbLey19032: r.pctCtbLey19032.toString(),
    pctCtbAsigFamiliares: r.pctCtbAsigFamiliares.toString(),
    pctCtbFondoEmpleo: r.pctCtbFondoEmpleo.toString(),
    pctCtbObraSocial: r.pctCtbObraSocial.toString(),
    pctCtbArt: r.pctCtbArt.toString(),
    pctDescJubilacion: r.pctDescJubilacion.toString(),
    pctDescLey19032: r.pctDescLey19032.toString(),
    pctDescObraSocial: r.pctDescObraSocial.toString(),
    pctDescCuotaSindical: r.pctDescCuotaSindical.toString(),
    pctDescSeguroSepelio: r.pctDescSeguroSepelio.toString(),
  });

  function f(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function n(v: string) { return parseFloat(v) || 0; }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const body = {
      remuneracionAsignada: n(fields.remuneracionAsignada),
      seccion: fields.seccion,
      modalidad: fields.modalidad,
      obraSocialNombre: fields.obraSocialNombre,
      lugaryFecha: fields.lugaryFecha,
      cctRates: {
        sueldoDiario: n(fields.sueldoDiario),
        diasHabilesMes: n(fields.diasHabilesMes),
        presentismo: n(fields.presentismo),
        kmRate0323: n(fields.kmRate0323),
        dietasKm: n(fields.dietasKm),
        diaViaticoRate0395: n(fields.diaViaticoRate0395),
        homeNights: n(fields.homeNights),
        nocheViaticoRate0401: n(fields.nocheViaticoRate0401),
        comidaMonto: n(fields.comidaMonto),
        adicionalNoRem: n(fields.adicionalNoRem),
        artSumaFija: n(fields.artSumaFija),
        costoCCT: n(fields.costoCCT),
        seguroVida: n(fields.seguroVida),
        pctCtbJubilacion: n(fields.pctCtbJubilacion),
        pctCtbLey19032: n(fields.pctCtbLey19032),
        pctCtbAsigFamiliares: n(fields.pctCtbAsigFamiliares),
        pctCtbFondoEmpleo: n(fields.pctCtbFondoEmpleo),
        pctCtbObraSocial: n(fields.pctCtbObraSocial),
        pctCtbArt: n(fields.pctCtbArt),
        pctDescJubilacion: n(fields.pctDescJubilacion),
        pctDescLey19032: n(fields.pctDescLey19032),
        pctDescObraSocial: n(fields.pctDescObraSocial),
        pctDescCuotaSindical: n(fields.pctDescCuotaSindical),
        pctDescSeguroSepelio: n(fields.pctDescSeguroSepelio),
      } satisfies CctRates,
    };

    try {
      const res = await fetch(`/api/empleados/${empleadoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const Input = ({
    label, field, type = "number"
  }: { label: string; field: keyof typeof fields; type?: string }) => (
    <div>
      <label className="block text-xs text-[#4A5568] mb-1">{label}</label>
      <input
        type={type}
        value={fields[field]}
        onChange={f(field)}
        step="any"
        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#C9A84C]"
      />
    </div>
  );

  const hasConfig = !!initial.remuneracionAsignada;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#0F1A2E]">Configuración CCT / Tasas</span>
          {hasConfig ? (
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">configurado</span>
          ) : (
            <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">pendiente</span>
          )}
        </div>
        <span className="text-[#4A5568] text-lg">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form onSubmit={handleSave} className="border-t border-gray-100 p-5 space-y-5">
          {/* Datos fijos del empleado */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Datos del recibo</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Remuneración asignada ($)" field="remuneracionAsignada" />
              <Input label="Sección" field="seccion" type="text" />
              <Input label="Modalidad" field="modalidad" type="text" />
              <Input label="Obra social (nombre)" field="obraSocialNombre" type="text" />
              <div className="sm:col-span-2">
                <Input label="Lugar y fecha (ej: Rosario, Agosto 2026)" field="lugaryFecha" type="text" />
              </div>
            </div>
          </div>

          {/* Tasas de sueldo */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Tasas sueldo (0301 / 0305 / 0323)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="$/día hábil (0301)" field="sueldoDiario" />
              <Input label="Días hábiles mes (divisor)" field="diasHabilesMes" />
              <Input label="Presentismo mensual (0305)" field="presentismo" />
              <Input label="$/km remunerativo (0323)" field="kmRate0323" />
              <Input label="Km por dieta (0395)" field="dietasKm" />
            </div>
          </div>

          {/* Viáticos */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Viáticos no remunerativos (0395 / 0401 / 0402 / 9999)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="$/dieta (0395)" field="diaViaticoRate0395" />
              <Input label="Noches en casa por ciclo" field="homeNights" />
              <Input label="$/pernoctada (0401)" field="nocheViaticoRate0401" />
              <Input label="Comida fija (0402)" field="comidaMonto" />
              <Input label="Adicional no rem fijo (9999)" field="adicionalNoRem" />
            </div>
          </div>

          {/* Fijos empleador */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Montos fijos empleador</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="ART suma fija ($)" field="artSumaFija" />
              <Input label="Costo CCT ($)" field="costoCCT" />
              <Input label="Seguro de vida km ($)" field="seguroVida" />
            </div>
          </div>

          {/* % empleador */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Contribuciones empleador (%)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="Jubilación (5010)" field="pctCtbJubilacion" />
              <Input label="Ley 19032 (5020)" field="pctCtbLey19032" />
              <Input label="Asig. familiares (5030)" field="pctCtbAsigFamiliares" />
              <Input label="Fondo empleo (5040)" field="pctCtbFondoEmpleo" />
              <Input label="Obra social (5050)" field="pctCtbObraSocial" />
              <Input label="ART % (5060)" field="pctCtbArt" />
            </div>
          </div>

          {/* % descuentos */}
          <div>
            <p className="text-xs font-bold text-[#4A5568] uppercase tracking-wider mb-3">Descuentos trabajador (%)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="Jubilación (4010)" field="pctDescJubilacion" />
              <Input label="Ley 19032 (4020)" field="pctDescLey19032" />
              <Input label="Obra social (4051)" field="pctDescObraSocial" />
              <Input label="Cuota sindical (4210)" field="pctDescCuotaSindical" />
              <Input label="Seguro sepelio (4211)" field="pctDescSeguroSepelio" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {saved && <p className="text-green-600 text-sm">Guardado correctamente.</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#0F1A2E] text-white font-bold px-5 py-2 rounded text-sm hover:bg-[#1E3A5F] transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </form>
      )}
    </div>
  );
}
