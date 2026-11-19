"use client";

type Mes = { key: string; label: string; total: number };

function formatPesos(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n.toLocaleString("es-AR")}`;
}

function mesLabel(key: string): string {
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [year, month] = key.split("-");
  return `${MESES[parseInt(month) - 1]} ${year}`;
}

export default function FacturacionChart({ data }: { data: Mes[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-[#4A5568] text-sm">
        Sin datos de facturación todavía.
      </div>
    );
  }

  // Orden descendente (más reciente primero)
  const sorted = [...data].sort((a, b) => b.key.localeCompare(a.key));
  const max = Math.max(...sorted.map((d) => d.total), 1);

  return (
    <div className="space-y-2.5">
      {sorted.map((d) => {
        const pct = Math.max((d.total / max) * 100, d.total > 0 ? 2 : 0);
        return (
          <div key={d.key} className="flex items-center gap-3">
            {/* Etiqueta del mes */}
            <span className="text-xs text-[#4A5568] w-16 shrink-0 text-right">
              {mesLabel(d.key)}
            </span>
            {/* Barra */}
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C9A84C] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            {/* Valor */}
            <span className="text-xs font-semibold text-[#0F1A2E] w-14 shrink-0">
              {formatPesos(d.total)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
