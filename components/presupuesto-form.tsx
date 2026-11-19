"use client";

import { useState } from "react";

const TIPOS_CARGA = [
  "Carga General",
  "Carga Refrigerada",
  "Carga a Granel",
  "Carga Sobredimensionada",
  "Carga Peligrosa",
  "Puerto / Importación / Exportación",
  "Otro",
];

type FormState = "idle" | "loading" | "success" | "error";

export default function PresupuestoForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data: Record<string, string> = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v)])
    );
    // Convertir fecha DD/MM/AAAA → YYYY-MM-DD
    if (data.fechaEstimada) {
      const m = data.fechaEstimada.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) data.fechaEstimada = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }

    try {
      const res = await fetch("/api/presupuesto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setState("success");
      form.reset();
    } catch {
      setState("error");
      setErrorMsg("Hubo un problema. Por favor intentá de nuevo o escribinos por WhatsApp.");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white/10 border border-[#C9A84C]/40 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="font-heading text-2xl font-bold text-white uppercase mb-2">
          ¡Presupuesto recibido!
        </h3>
        <p className="text-white/70 text-sm">
          Te contactamos a la brevedad con el precio y fecha de salida.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-6 text-[#C9A84C] text-sm underline underline-offset-4 hover:text-[#E8C96A] transition-colors"
        >
          Enviar otro presupuesto
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombre *" name="nombre" required placeholder="Tu nombre completo" />
        <Field label="Empresa" name="empresa" placeholder="Nombre de tu empresa (opcional)" />
        <Field label="Teléfono *" name="telefono" required placeholder="Ej: 341 555-0000" type="tel" />
        <Field label="Email *" name="email" required placeholder="tu@email.com" type="email" />
        <Field label="Origen *" name="origen" required placeholder="Ciudad de origen" />
        <Field label="Destino *" name="destino" required placeholder="Ciudad de destino" />

        {/* Tipo de carga */}
        <div className="flex flex-col gap-1.5">
          <label className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Tipo de carga *
          </label>
          <select
            name="tipoCarga"
            required
            className="bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors"
            defaultValue=""
          >
            <option value="" disabled className="bg-[#1E3A5F]">
              Seleccioná el tipo
            </option>
            {TIPOS_CARGA.map((t) => (
              <option key={t} value={t} className="bg-[#1E3A5F]">
                {t}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Peso aproximado"
          name="peso"
          placeholder="Ej: 5 tn, 500 kg"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Fecha estimada de envío
          </label>
          <input
            name="fechaEstimada"
            type="text"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            className="bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/30"
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-white/80 text-xs font-medium uppercase tracking-wider">
            Información adicional
          </label>
          <textarea
            name="mensaje"
            rows={3}
            placeholder="Dimensiones, requisitos especiales, urgencia..."
            className="bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors resize-none placeholder:text-white/30"
          />
        </div>
      </div>

      {state === "error" && (
        <p className="mt-4 text-red-400 text-xs text-center">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 w-full bg-[#C9A84C] text-[#0F1A2E] font-bold py-3.5 rounded text-base hover:bg-[#E8C96A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Enviando..." : "Solicitar presupuesto gratis →"}
      </button>

      <p className="mt-3 text-center text-white/40 text-xs">
        Sin compromiso · Te respondemos a la brevedad
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/80 text-xs font-medium uppercase tracking-wider">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="bg-white/10 border border-white/20 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors placeholder:text-white/30"
      />
    </div>
  );
}
