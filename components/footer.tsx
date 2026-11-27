import Link from "next/link";
import OBIsotipo from "@/components/OBIsotipo";

export default function Footer() {
  return (
    <footer className="bg-[#0F1A2E] text-white/70 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <OBIsotipo size={36} />
              <div>
                <div className="text-white font-bold text-base tracking-wide">ORO BLANCO</div>
                <div className="text-[#C9A84C] text-[10px] tracking-widest uppercase">
                  Transporte · Logística
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Empresa de transporte de carga nacional con base en Rosario. Fletes confiables,
              documentación completa y trato directo.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Servicios
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Carga General",
                "Carga Refrigerada",
                "Carga a Granel",
                "Carga Sobredimensionada",
                "Carga Peligrosa",
                "Puerto Rosario",
              ].map((s) => (
                <li key={s}>
                  <a href="#servicios" className="hover:text-[#C9A84C] transition-colors">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Empresa
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#nosotros" className="hover:text-[#C9A84C] transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="#cobertura" className="hover:text-[#C9A84C] transition-colors">
                  Cobertura nacional
                </a>
              </li>
              <li>
                <a href="#presupuesto" className="hover:text-[#C9A84C] transition-colors">
                  Solicitar presupuesto
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm">
              <li>📍 Rosario, Santa Fe</li>
              <li>
                <a href="https://transporteoroblanco.com" className="hover:text-[#C9A84C] transition-colors">
                  transporteoroblanco.com
                </a>
              </li>
              <li>
                <a href="tel:+543413824798" className="hover:text-[#C9A84C] transition-colors">
                  +54 341 382-4798
                </a>
              </li>
              <li>🕐 Lun–Vie 8:00–18:00</li>
              <li className="pt-1">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Respuesta en &lt; 2 horas
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <span>© 2026 Oro Blanco Transporte y Logística. Todos los derechos reservados.</span>
          <span>Rosario · Santa Fe · Argentina</span>
        </div>
      </div>
    </footer>
  );
}
