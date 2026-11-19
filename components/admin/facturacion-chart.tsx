"use client";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

type Mes = { key: string; label: string; total: number };

function formatPesos(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toLocaleString("es-AR")}`;
}

export default function FacturacionChart({ data }: { data: Mes[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-[#4A5568] text-sm">
        Sin datos de facturación todavía.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.total), 1);
  const W = 60; // ancho por barra (incluye gap)
  const BAR_W = 40;
  const H = 160; // altura del área de barras
  const MARGIN_B = 36; // para etiquetas de mes
  const MARGIN_T = 20; // para valores encima

  const totalW = data.length * W;

  return (
    <div className="overflow-x-auto">
      <svg
        width={totalW}
        height={H + MARGIN_B + MARGIN_T}
        className="min-w-full"
        style={{ minWidth: `${totalW}px` }}
      >
        {data.map((d, i) => {
          const barH = Math.max((d.total / max) * H, d.total > 0 ? 4 : 0);
          const x = i * W + (W - BAR_W) / 2;
          const y = MARGIN_T + H - barH;

          return (
            <g key={d.key}>
              {/* Barra */}
              <rect
                x={x}
                y={y}
                width={BAR_W}
                height={barH}
                rx={4}
                fill="#C9A84C"
                opacity={0.9}
              />
              {/* Valor encima */}
              {d.total > 0 && (
                <text
                  x={x + BAR_W / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#4A5568"
                  fontFamily="system-ui"
                >
                  {formatPesos(d.total)}
                </text>
              )}
              {/* Etiqueta del mes */}
              <text
                x={x + BAR_W / 2}
                y={MARGIN_T + H + 18}
                textAnchor="middle"
                fontSize={11}
                fill="#4A5568"
                fontFamily="system-ui"
              >
                {d.label}
              </text>
              {/* Año (solo si es enero o primer mes) */}
              {(d.key.endsWith("-01") || i === 0) && (
                <text
                  x={x + BAR_W / 2}
                  y={MARGIN_T + H + 32}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9AA5B4"
                  fontFamily="system-ui"
                >
                  {d.key.slice(0, 4)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
