"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS, TIPOS_CARGA } from "@/lib/constants";
import ClienteCombobox from "@/components/admin/cliente-combobox";

type VehiculoOpt = { id: string; patente: string; marca: string; modelo: string };
type FacturaItem = { id: string; tipo: string; puntoVenta: string; numero: string; total: number; viajeId: string | null };

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
  clienteId: string | null;
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

/** Convierte Date/ISO → DD/MM/AAAA para mostrar en el input */
function toArgDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const mon = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${date.getUTCFullYear()}`;
}

/** Convierte DD/MM/AAAA → YYYY-MM-DD para la API */
function fromArgDate(s: string): string {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return "";
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Formatea número como pesos argentinos: 450000 → "450.000" */
function formatPesos(n: number | null | undefined): string {
  if (n == null) return "";
  return n.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

/** Parsea pesos con separadores → número: "450.000" → 450000 */
function parsePesos(s: string): string {
  // quitar puntos de miles (es-AR usa punto), reemplazar coma decimal
  return s.replace(/\./g, "").replace(",", ".").trim();
}

export default function ViajeForm({
  viaje,
  vehiculos = [],
  facturasVinculadas = [],
  facturasDisponibles = [],
}: {
  viaje?: ViajeData;
  vehiculos?: VehiculoOpt[];
  facturasVinculadas?: FacturaItem[];
  facturasDisponibles?: FacturaItem[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fechaStr, setFechaStr] = useState(toArgDate(viaje?.fecha));
  const [precioStr, setPrecioStr] = useState(formatPesos(viaje?.precio));
  const [vinculadas, setVinculadas] = useState(facturasVinculadas);
  const [disponibles, setDisponibles] = useState(facturasDisponibles);
  const [linkingId, setLinkingId] = useState("");
  const [linking, setLinking] = useState(false);
  const [clienteId, setClienteId] = useState<string | null>(viaje?.clienteId ?? null);
  const [clienteNombre, setClienteNombre] = useState<string | null>(
    viaje?.clienteId ? (viaje.empresa?.trim() || viaje.cliente) : null
  );

  const isEdit = !!viaje;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const data: Record<string, string> = Object.fromEntries(
      [...new FormData(form).entries()].map(([k, v]) => [k, String(v)])
    );

    // Convertir fecha AR → ISO
    data.fecha = fromArgDate(fechaStr);
    // Normalizar precio (quitar separadores de miles)
    data.precio = parsePesos(precioStr);
    // Cliente seleccionado — propagar clienteId y también el nombre de texto (campo requerido en DB)
    if (clienteId) {
      data.clienteId = clienteId;
      if (clienteNombre && !data.cliente) data.cliente = clienteNombre;
    }
    if (!data.cliente && !clienteId) {
      setError("Seleccioná un cliente.");
      setLoading(false);
      return;
    }

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

  async function linkFactura() {
    if (!linkingId) return;
    setLinking(true);
    await fetch(`/api/facturas/${linkingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viajeId: viaje!.id }),
    });
    const f = disponibles.find((x) => x.id === linkingId)!;
    setVinculadas((prev) => [...prev, { ...f, viajeId: viaje!.id }]);
    setDisponibles((prev) => prev.filter((x) => x.id !== linkingId));
    setLinkingId("");
    setLinking(false);
  }

  async function unlinkFactura(facturaId: string) {
    await fetch(`/api/facturas/${facturaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ viajeId: null }),
    });
    const f = vinculadas.find((x) => x.id === facturaId)!;
    setDisponibles((prev) => [...prev, { ...f, viajeId: null }]);
    setVinculadas((prev) => prev.filter((x) => x.id !== facturaId));
  }

  const totalFacturado = vinculadas.reduce((s, f) => s + f.total, 0);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <SelectField label="Estado" name="estado" defaultValue={viaje?.estado ?? "PENDIENTE"} options={ESTADOS} />

          {/* Fecha en formato es-AR */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Fecha del viaje</label>
            <input
              type="text"
              placeholder="DD/MM/AAAA"
              value={fechaStr}
              onChange={(e) => setFechaStr(e.target.value)}
              maxLength={10}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
            />
          </div>

          {/* Cliente */}
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">
              Cliente *{" "}
              {clienteId && (
                <a href={`/admin/clientes/${clienteId}`} className="normal-case font-normal text-[#1E3A5F] hover:underline ml-1">
                  ver perfil →
                </a>
              )}
            </label>
            <ClienteCombobox
              value={clienteId}
              clienteNombre={clienteNombre ?? undefined}
              onChange={(id, c) => {
                setClienteId(id);
                setClienteNombre(id && c ? (c.empresa?.trim() || c.nombre) : null);
              }}
            />
          </div>

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

          {/* Precio con formato pesos es-AR */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Precio (ARS)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Ej: 450.000"
              value={precioStr}
              onChange={(e) => setPrecioStr(e.target.value)}
              onBlur={() => {
                const n = parseFloat(parsePesos(precioStr));
                if (!isNaN(n)) setPrecioStr(formatPesos(n));
              }}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E] placeholder:text-gray-400"
            />
          </div>

          <Field label="Nro. remito" name="nroRemito" placeholder="R-0001-00000123" defaultValue={viaje?.nroRemito ?? ""} />

          {/* Vehículo */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#4A5568] text-xs font-medium uppercase tracking-wider">Vehículo</label>
            <select
              name="vehiculoId"
              defaultValue={viaje?.vehiculoId ?? ""}
              className="border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9A84C] transition-colors text-[#0F1A2E]"
            >
              <option value="">— Sin asignar —</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.patente} · {v.marca} {v.modelo}</option>
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

      {/* Facturas — solo en modo edición */}
      {isEdit && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 max-w-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wider">Facturas vinculadas</p>
            {totalFacturado > 0 && (
              <span className="text-xs font-semibold text-[#1E3A5F]">
                Total: ${totalFacturado.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {/* Vinculadas */}
          {vinculadas.length > 0 ? (
            <ul className="divide-y divide-gray-50 mb-4">
              {vinculadas.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-xs font-semibold text-[#0F1A2E]">{f.tipo}</span>
                    <span className="text-xs text-[#4A5568] ml-2 font-mono">{f.puntoVenta}-{f.numero}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#0F1A2E]">
                      ${f.total.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => unlinkFactura(f.id)} className="text-xs text-red-400 hover:text-red-600">
                      Desvincular
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#4A5568] mb-4">Sin facturas vinculadas.</p>
          )}

          {/* Vincular nueva */}
          {disponibles.length > 0 ? (
            <div className="flex gap-2 items-center border-t border-gray-50 pt-3">
              <select
                value={linkingId}
                onChange={(e) => setLinkingId(e.target.value)}
                className="flex-1 text-xs border border-gray-200 rounded px-2.5 py-2 focus:outline-none focus:border-[#C9A84C] text-[#0F1A2E]"
              >
                <option value="">— Elegir factura para vincular —</option>
                {disponibles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.tipo} {f.puntoVenta}-{f.numero} · ${f.total.toLocaleString("es-AR", { maximumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
              <button
                onClick={linkFactura}
                disabled={!linkingId || linking}
                className="text-xs bg-[#1E3A5F] text-white font-semibold px-3 py-2 rounded hover:bg-[#0F1A2E] transition-colors disabled:opacity-50"
              >
                {linking ? "..." : "Vincular"}
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#4A5568] border-t border-gray-50 pt-3">
              No hay facturas sin viaje disponibles.{" "}
              <a href="/admin/facturas" className="text-[#1E3A5F] hover:underline">Importar facturas →</a>
            </p>
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
