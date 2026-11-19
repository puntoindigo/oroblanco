"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Viaje } from "@prisma/client";

const TIPOS_CARGA = [
  "Carga General",
  "Carga Refrigerada",
  "Carga a Granel",
  "Carga Sobredimensionada",
  "Carga Peligrosa",
  "Puerto / Import / Export",
];

const ESTADOS = ["PROGRAMADO", "EN_CURSO", "ENTREGADO", "CANCELADO"] as const;

export default function ViajeForm({ viaje }: { viaje?: Viaje }) {
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
    const payload = {
      ...data,
      precio: parseFloat(data.precio as string),
      peso: data.peso ? parseFloat(data.peso as string) : null,
    };

    const url = isEdit ? `/api/viajes/${viaje!.id}` : "/api/viajes";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");
      router.push("/admin/viajes");
      router.refresh();
    } catch {
      setError("Error al guardar el viaje. Revisá los datos.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Fecha *"
          name="fecha"
          type="date"
          required
          defaultValue={viaje?.fecha ? new Date(viaje.fecha).toISOString().split("T")[0] : ""}
        />
        <Field
          label="Cliente *"
          name="cliente"
          required
          placeholder="Nombre del cliente"
          defaultValue={viaje?.cliente}
        />
        <Field
          label="Teléfono cliente"
          name="clienteTel"
          type="tel"
          placeholder="341 555-0000"
          defaultValue={viaje?.clienteTel ?? ""}
        />
        <Field
          label="Email cliente"
          name="clienteEmail"
          type="email"
          placeholder="cliente@email.com"
          defaultValue={viaje?.clienteEmail ?? ""}
        />
        <Field
          label="Origen *"
          name="origen"
          required
          placeholder="Ciudad de origen"
          defaultValue={viaje?.origen}
        />
        <Field
          label="Destino *"
          name="destino"
          required
          placeholder="Ciudad de destino"
          defaultValue={viaje?.destino}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">
            Tipo de carga *
          </label>
          <select
            name="tipoCarga"
            required
            defaultValue={viaje?.tipoCarga ?? ""}
            className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
          >
            <option value="" disabled>
              Seleccioná
            </option>
            {TIPOS_CARGA.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Peso (tn)"
          name="peso"
          type="number"
          placeholder="Ej: 5.5"
          defaultValue={viaje?.peso?.toString() ?? ""}
        />

        <Field
          label="Precio (ARS) *"
          name="precio"
          type="number"
          required
          placeholder="Ej: 450000"
          defaultValue={viaje?.precio?.toString() ?? ""}
        />

        <Field
          label="Nro. remito"
          name="nroRemito"
          placeholder="R-0001-00000123"
          defaultValue={viaje?.nroRemito ?? ""}
        />

        {isEdit && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">
              Estado
            </label>
            <select
              name="estado"
              defaultValue={viaje?.estado}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
            >
              {ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

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

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
      />
    </div>
  );
}
