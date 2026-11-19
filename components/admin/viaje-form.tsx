"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS, TIPOS_CARGA } from "@/lib/constants";

type VehiculoOpt = { id: string; patente: string; marca: string; modelo: string };

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
}: {
  viaje?: ViajeData;
  vehiculos?: VehiculoOpt[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!viaje;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

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

  const toIsoDate = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Estado */}
        <SelectField
          label="Estado"
          name="estado"
          defaultValue={viaje?.estado ?? "PENDIENTE"}
          options={ESTADOS}
        />

        {/* Fecha */}
        <Field
          label="Fecha del viaje"
          name="fecha"
          type="date"
          defaultValue={toIsoDate(viaje?.fecha)}
        />

        {/* Cliente */}
        <Field label="Cliente *" name="cliente" required placeholder="Nombre o empresa" defaultValue={viaje?.cliente} />
        <Field label="Empresa" name="empresa" placeholder="Razón social" defaultValue={viaje?.empresa ?? ""} />
        <Field label="Teléfono" name="clienteTel" type="tel" placeholder="341 555-0000" defaultValue={viaje?.clienteTel ?? ""} />
        <Field label="Email" name="clienteEmail" type="email" placeholder="cliente@email.com" defaultValue={viaje?.clienteEmail ?? ""} />

        {/* Ruta */}
        <ProvinciasSelect label="Origen *" name="origen" required defaultValue={viaje?.origen ?? ""} />
        <ProvinciasSelect label="Destino *" name="destino" required defaultValue={viaje?.destino ?? ""} />

        {/* Carga */}
        <SelectField
          label="Tipo de carga *"
          name="tipoCarga"
          required
          defaultValue={viaje?.tipoCarga ?? "Carga General"}
          options={TIPOS_CARGA.map((t) => ({ value: t, label: t }))}
        />

        {/* Pesos */}
        <Field label="Peso VGM (tn)" name="pesoVgm" type="number" placeholder="Ej: 22.5" defaultValue={viaje?.pesoVgm?.toString() ?? ""} />
        <Field label="Tara (tn)" name="tara" type="number" placeholder="Ej: 7.0" defaultValue={viaje?.tara?.toString() ?? ""} />

        {/* Precio */}
        <Field label="Precio (ARS)" name="precio" type="number" placeholder="Ej: 450000" defaultValue={viaje?.precio?.toString() ?? ""} />
        <Field label="Nro. remito" name="nroRemito" placeholder="R-0001-00000123" defaultValue={viaje?.nroRemito ?? ""} />

        {/* Vehículo */}
        {vehiculos.length > 0 && (
          <SelectField
            label="Vehículo"
            name="vehiculoId"
            defaultValue={viaje?.vehiculoId ?? ""}
            options={[
              { value: "", label: "— Sin asignar —" },
              ...vehiculos.map((v) => ({
                value: v.id,
                label: `${v.patente} · ${v.marca} ${v.modelo}`,
              })),
            ]}
          />
        )}

        {/* Notas */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">
            Notas internas
          </label>
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
