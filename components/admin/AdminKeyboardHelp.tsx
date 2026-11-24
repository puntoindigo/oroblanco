"use client";

const SHORTCUTS = [
  { group: "Secciones", items: [
    { keys: ["V"], label: "Viajes" },
    { keys: ["C"], label: "Clientes" },
    { keys: ["F"], label: "Facturas" },
    { keys: ["E"], label: "Empleados" },
    { keys: ["G"], label: "Gastos" },
    { keys: ["P"], label: "Pagos / Cheques" },
    { keys: ["U"], label: "Usuarios" },
    { keys: ["D"], label: "Documentos" },
    { keys: ["H"], label: "Panel de control" },
  ]},
  { group: "Listas", items: [
    { keys: ["↑", "↓"], label: "Navegar filas" },
    { keys: ["Enter"], label: "Abrir ítem seleccionado" },
    { keys: ["N"], label: "Nuevo ítem" },
    { keys: ["Esc"], label: "Deseleccionar" },
  ]},
  { group: "General", items: [
    { keys: ["?"], label: "Mostrar / ocultar esta ayuda" },
  ]},
];

export default function AdminKeyboardHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-[#0F1A2E] rounded-2xl shadow-2xl w-full max-w-md p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-base text-[#C9A84C]">Atajos de teclado</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-lg leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {SHORTCUTS.map(({ group, items }) => (
            <div key={group}>
              <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">{group}</div>
              <div className="space-y-1.5">
                {items.map(({ keys, label }) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-white/70">{label}</span>
                    <div className="flex gap-1 shrink-0">
                      {keys.map((k) => (
                        <kbd
                          key={k}
                          className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 rounded bg-white/10 border border-white/20 text-[11px] font-mono font-semibold text-white/80"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 text-[11px] text-white/30 text-center">
          Los atajos no funcionan cuando el cursor está en un campo de texto.
        </p>
      </div>
    </div>
  );
}
