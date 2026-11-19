import Nav from "@/components/nav";
import Footer from "@/components/footer";
import PresupuestoForm from "@/components/presupuesto-form";
import WhatsAppFab from "@/components/whatsapp-fab";

const SERVICIOS = [
  {
    icon: "📦",
    titulo: "Carga General",
    desc: "Mercadería paletizada, caja cerrada, distribución puerta a puerta. Seguimiento en tiempo real.",
    tags: ["FTL · LTL", "Pallets", "Caja cerrada"],
  },
  {
    icon: "❄️",
    titulo: "Carga Refrigerada",
    desc: "Cadena de frío continua de 0°C a +15°C. Equipos certificados para alimentos, medicamentos y productos frescos.",
    tags: ["Cadena de frío", "SENASA", "0°C a +15°C"],
  },
  {
    icon: "🌾",
    titulo: "Carga a Granel",
    desc: "Cereales, oleaginosas, semillas y minerales. Camiones graneleros y cisternas con capacidad hasta 30 tn.",
    tags: ["Granelero", "Cisterna", "Hasta 30 tn"],
  },
  {
    icon: "🏗️",
    titulo: "Carga Sobredimensionada",
    desc: "Maquinaria pesada, estructuras y equipos industriales. Permisos especiales y escoltas incluidas.",
    tags: ["Permisos", "Escolta", "Maquinaria"],
  },
  {
    icon: "⚠️",
    titulo: "Carga Peligrosa",
    desc: "Materiales peligrosos conforme a la norma ADR. Personal habilitado CNRT y vehículos certificados.",
    tags: ["ADR", "CNRT", "Residuos ind."],
  },
  {
    icon: "🚢",
    titulo: "Puerto Rosario",
    desc: "Conexión directa con el Puerto de Rosario. Gestión de FCL y LCL para importación y exportación.",
    tags: ["FCL · LCL", "Import/Export", "Despacho"],
  },
];

const PILARES = [
  {
    icon: "🛡️",
    titulo: "Seguro de carga incluido",
    desc: "Toda carga viaja con cobertura. Documentación y remito digital entregados en cada flete.",
  },
  {
    icon: "📍",
    titulo: "Rastreo GPS en tiempo real",
    desc: "Seguís tu carga desde que sale hasta que llega. Sin sorpresas ni llamados para averiguar.",
  },
  {
    icon: "⚡",
    titulo: "Presupuesto en 2 horas",
    desc: "Completás el formulario y en menos de 2 horas tenés precio y fecha de salida confirmados.",
  },
];

const DESTINOS = [
  "Buenos Aires",
  "Córdoba",
  "Mendoza",
  "Tucumán",
  "Santa Fe",
  "Entre Ríos",
  "Chaco",
  "Corrientes",
  "Neuquén",
  "Bariloche",
  "Patagonia",
  "CABA",
];

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F1A2E]">
        {/* Background image overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80&auto=format')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1A2E]/60 via-transparent to-[#0F1A2E]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] text-xs font-medium px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            Base Rosario · Puerto · Cobertura nacional
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl lg:text-8xl font-bold text-white leading-none mb-6 uppercase tracking-tight">
            FLETES{" "}
            <span className="text-[#C9A84C]">NACIONALES</span>
            <br />
            QUE LLEGAN.
          </h1>

          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Transporte de carga nacional e interprovincial desde Rosario. Carga general,
            refrigerada, a granel, peligrosa y conexión directa con el Puerto de Rosario.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#presupuesto"
              className="bg-[#C9A84C] text-[#0F1A2E] font-bold px-8 py-4 rounded text-base hover:bg-[#E8C96A] transition-colors"
            >
              Pedir presupuesto gratis
            </a>
            <a
              href="#servicios"
              className="border border-white/30 text-white px-8 py-4 rounded text-base hover:bg-white/10 transition-colors"
            >
              Ver servicios
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { n: "15+", label: "años de experiencia" },
              { n: "24/7", label: "seguimiento GPS" },
              { n: "< 2h", label: "respuesta de presupuesto" },
            ].map(({ n, label }) => (
              <div key={n} className="text-center">
                <div className="font-heading text-3xl font-bold text-[#C9A84C]">{n}</div>
                <div className="text-white/50 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="py-20 bg-[#F8F8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
              Lo que transportamos
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0F1A2E] mt-2 uppercase">
              Servicios de Carga
            </h2>
            <p className="text-[#4A5568] mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Flota equipada para todo tipo de mercadería. Habilitaciones vigentes, cobertura
              nacional y atención directa sin intermediarios.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICIOS.map((s) => (
              <div
                key={s.titulo}
                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-[#C9A84C]/30 transition-all group"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-heading text-xl font-bold text-[#0F1A2E] uppercase mb-2 group-hover:text-[#1E3A5F] transition-colors">
                  {s.titulo}
                </h3>
                <p className="text-[#4A5568] text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-[#C9A84C]/10 text-[#8B6914] px-2 py-0.5 rounded-full font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ NOSOTROS */}
      <section id="nosotros" className="py-20 bg-[#0F1A2E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
              La diferencia
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2 uppercase">
              Por qué Oro Blanco
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {PILARES.map((p) => (
              <div
                key={p.titulo}
                className="bg-[#1E3A5F]/30 border border-white/10 rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-heading text-xl font-bold text-white uppercase mb-2">
                  {p.titulo}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Puerto Rosario highlight */}
          <div className="bg-[#1E3A5F]/40 border border-[#C9A84C]/20 rounded-2xl p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-6xl">🚢</div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-heading text-3xl font-bold text-white uppercase mb-2">
                Conexión directa Puerto Rosario
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
                Operamos en el complejo portuario de Rosario, uno de los más importantes de
                Sudamérica. Gestionamos despacho aduanero, FCL (carga completa) y LCL (carga
                consolidada) para importación y exportación. Tu mercadería desde o hacia cualquier
                destino del mundo.
              </p>
            </div>
            <a
              href="#presupuesto"
              className="shrink-0 bg-[#C9A84C] text-[#0F1A2E] font-bold px-6 py-3 rounded text-sm hover:bg-[#E8C96A] transition-colors whitespace-nowrap"
            >
              Consultar puerto
            </a>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section id="cobertura" className="py-20 bg-[#F8F8F4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
              Destinos
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0F1A2E] mt-2 uppercase">
              Cobertura Nacional
            </h2>
            <p className="text-[#4A5568] mt-3 text-sm sm:text-base">
              Desde Rosario a todo el país. Si tu destino no está en la lista, consultanos de todas
              formas.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {DESTINOS.map((d) => (
              <div
                key={d}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-[#1E3A5F] font-medium shadow-sm"
              >
                <span className="text-[#C9A84C]">●</span>
                {d}
              </div>
            ))}
            <div className="flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-full px-4 py-2 text-sm text-[#8B6914] font-medium">
              + más destinos
            </div>
          </div>

          {/* Hub visual */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 text-center shadow-sm">
            <div className="text-[#C9A84C] text-xs uppercase tracking-widest font-semibold mb-2">
              Hub central
            </div>
            <div className="font-heading text-5xl font-bold text-[#0F1A2E] uppercase mb-1">
              ROSARIO
            </div>
            <div className="text-[#4A5568] text-sm mb-6">
              Santa Fe, Argentina · Puerto Internacional
            </div>
            <div className="flex justify-center gap-6 text-sm text-[#4A5568]">
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-[#1E3A5F]">300 km</div>
                <div className="text-xs">a Buenos Aires</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-[#1E3A5F]">700 km</div>
                <div className="text-xs">a Córdoba</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-2xl font-bold text-[#1E3A5F]">1.100 km</div>
                <div className="text-xs">a Mendoza</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRESUPUESTO FORM */}
      <section id="presupuesto" className="py-20 bg-[#1E3A5F]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">
              Gratis · Sin compromiso
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-white mt-2 uppercase">
              Pedí tu presupuesto
            </h2>
            <p className="text-white/70 mt-3 text-sm sm:text-base">
              Completá el formulario y en menos de 2 horas recibís el precio y la fecha de salida.
            </p>
          </div>
          <PresupuestoForm />
        </div>
      </section>

      <Footer />
      <WhatsAppFab />
    </>
  );
}
