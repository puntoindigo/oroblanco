"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS, TIPOS_CARGA } from "@/lib/constants";

type VehiculoOpt = { id: string; patente: string; marca: string; modelo: string };
type FacturaVinculada = { id: string; tipo: string; puntoVenta: string; numero: string; total: number; viajeId: string | null };

type ViajeData = {
  id: string;
  fecha: Date | null;
  origen: string;
  destino: string;
  tipoCarga: string;
  pesoVgm: number | null;
  tara: number | null;
  cliente: string;
  empresa: string | null;
  clienteEmail: string | null;
  clienteTel: string | null;
  precio: number | null;
  precioConIva: boolean;
  notas: string | null;
  nroRemito: string | null;
  estado: string;
  vehiculoId: string | null;
};

const ESTADOS = [
  { value: "PRESUPUESTO", label: "Presupuesto" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO", label: "En curso" },
  { value: "FACTURADO", label: "Facturado" },
  { value: "COBRADO", label: "Cobrado" },
  { value: "CANCELADO", label: "Cancelado" },
];

export default function ViajeForm({
  viaje,
  vehiculos = [],
  facturas = [],
}: {
  viaje?: ViajeData;
  vehiculos?: VehiculoOpt[];
  facturas?: FacturaVinculada[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [precioConIva, setPrecioConIva] = useState(viaje?.precioConIva ?? true);
  const [facturasState, setFacturasState] = useState(facturas);

  const isEdit = !!viaje;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data: Record<string, string> = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v)])
    );
    data.precioConIva = String(precioConIva);

    const url = isEdit ? `/api/viajes/${viaje!.id}` : "/api/viajes";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar");
      router.push("/admin/viajes");
      router.refresh();
    } catch {
      setError("Error al guardar. Revisá los datos.");
      setLoading(false);
    }
  }

  async function unlinkFactura(facturaId: string) {
    await fetch(`/api/facturas/${facturaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viajeId: null }),
    });
    setFacturasState((prev) => prev.filter((f) => f.id !== facturaId));
  }

  const toIsoDate = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  const totalFacturado = facturasState.reduce((s, f) => s + f.total, 0);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <SelectField label="Estado" name="estado" defaultValue={viaje?.estado ?? "PENDIENTE"} options={ESTADOS} />
          <Field label="Fecha del viaje" name="fecha" type="date" defaultValue={toIsoDate(viaje?.fecha)} />

          <Field label="Cliente *" name="cliente" required placeholder="Nombre o empresa" defaultValue={viaje?.cliente} />
          <Field label="Empresa" name="empresa" placeholder="Razón social" defaultValue={viaje?.empresa ?? ""} />
          <Field label="Teléfono" name="clienteTel" type="tel" placeholder="341 555-0000" defaultValue={viaje?.clienteTel ?? ""} />
          <Field label="Email" name="clienteEmail" type="email" placeholder="cliente@email.com" defaultValue={viaje?.clienteEmail ?? ""} />

          <ProvinciasSelect label="Origen *" name="origen" required defaultValue={viaje?.origen ?? ""} />
          <ProvinciasSelect label="Destino *" name="destino" required defaultValue={viaje?.destino ?? ""} />

          <SelectField
            label="Tipo de carga *"
            name="tipoCarga"
            required
            defaultValue={viaje?.tipoCarga ?? "Carga General"}
            options={TIPOS_CARGA.map((t) => ({ value: t, label: t }))}
          />

          <Field label="Peso VGM (tn)" name="pesoVgm" type="number" placeholder="Ej: 22.5" defaultValue={viaje?.pesoVgm?.toString() ?? ""} />
          <Field label="Tara (tn)" name="tara" type="number" placeholder="Ej: 7.0" defaultValue={viaje?.tara?.toString() ?? ""} />

          {/* Precio + IVA toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Precio (ARS)</label>
            <input
              name="precio"
              type="number"
              placeholder="Ej: 450000"
              defaultValue={viaje?.precio?.toString() ?? ""}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setPrecioConIva((v) => !v)}
              className={`self-start text-xs px-2.5 py-1 rounded-full font-medium transition-colors mt-0.5 ${
                precioConIva
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-amber-100 text-amber-700 hover:bg-amber-200"
              }`}
            >
              {precioConIva ? "IVA incluido" : "Sin IVA (neto)"}
            </button>
          </div>

          <Field label="Nro. remito" name="nroRemito" placeholder="R-0001-00000123" defaultValue={viaje?.nroRemito ?? ""} />

          {/* Vehículo — siempre visible */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Vehículo</label>
            <select
              name="vehiculoId"
              defaultValue={viaje?.vehiculoId ?? ""}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
            >
              <option value="">— Sin asignar —</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente} · {v.marca} {v.modelo}
                </option>
              ))}
              {vehiculos.length === 0 && (
                <option value="" disabled>No hay vehículos cargados</option>
              )}
            </select>
          </div>

          {/* Notas */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Notas internas</label>
            <textarea
              name="notas"
              rows={3}
              defaultValue={viaje?.notas ?? ""}
              placeholder="Observaciones, instrucciones especiales..."
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors resize-none text-[#0F1A2E] placeholder:text-gray-400"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-red-500 text-xs">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-2.5 rounded text-sm hover:bg-[#E8C96A] transition-colors disabled:opacity-60"
          >
            {loading ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar viaje"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-[#4A5568] px-5 py-2.5 rounded text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Facturas vinculadas — solo en modo edición */}
      {isEdit && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">
              Facturas vinculadas
            </p>
            {totalFacturado > 0 && (
              <span className="text-xs font-semibold text-[#1E3A5F]">
                Total: ${totalFacturado.toLocaleString("es-AR")}
              </span>
            )}
          </div>

          {facturasState.length === 0 ? (
            <p className="text-xs text-[#4A5568]">
              Ninguna factura vinculada a este viaje. Podés vincularlas desde{" "}
              <a href="/admin/facturas" className="text-[#1E3A5F] hover:text-[#C9A84C] underline">
                Facturas
              </a>
              .
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {facturasState.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-xs font-semibold text-[#0F1A2E]">{f.tipo}</span>
                    <span className="text-xs text-[#4A5568] ml-2 font-mono">
                      {f.puntoVenta}-{f.numero}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#0F1A2E]">
                      ${f.total.toLocaleString("es-AR")}
                    </span>
                    <button
                      onClick={() => unlinkFactura(f.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Desvincular
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, name, required, placeholder, type = "text", defaultValue }: {
  label: string; name: string; required?: boolean;
  placeholder?: string; type?: string; defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">{label}</label>
      <input
        name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue}
        className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
      />
    </div>
  );
}

function ProvinciasSelect({ label, name, required, defaultValue }: {
  label: string; name: string; required?: boolean; defaultValue: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">{label}</label>
      <select
        name={name} required={required} defaultValue={defaultValue}
        className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
      >
        <option value="" disabled>Seleccioná provincia</option>
        {PROVINCIAS.map((p) =>
          p.startsWith("—") ? (
            <option key={p} value="" disabled>{p}</option>
          ) : (
            <option key={p} value={p}>{p}</option>
          )
        )}
      </select>
    </div>
  );
}

function SelectField({ label, name, required, defaultValue, options }: {
  label: string; name: string; required?: boolean; defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">{label}</label>
      <select
        name={name} required={required} defaultValue={defaultValue}
        className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
