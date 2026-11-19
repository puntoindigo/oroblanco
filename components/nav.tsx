"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0F1A2E]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-18">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-[#C9A84C] flex items-center justify-center font-bold text-[#0F1A2E] text-sm font-heading">
            OB
          </div>
          <div>
            <div className="text-white font-heading font-bold text-base leading-tight tracking-wide">
              ORO BLANCO
            </div>
            <div className="text-[#C9A84C] text-[10px] font-medium leading-none tracking-widest uppercase">
              Transporte · Logística
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="#servicios" className="hover:text-[#C9A84C] transition-colors">
            Servicios
          </Link>
          <Link href="#cobertura" className="hover:text-[#C9A84C] transition-colors">
            Cobertura
          </Link>
          <Link href="#nosotros" className="hover:text-[#C9A84C] transition-colors">
            Nosotros
          </Link>
          <Link href="#presupuesto" className="hover:text-[#C9A84C] transition-colors">
            Contacto
          </Link>
          <Link
            href="#presupuesto"
            className="bg-[#C9A84C] text-[#0F1A2E] font-semibold px-4 py-2 rounded hover:bg-[#E8C96A] transition-colors"
          >
            Pedir presupuesto
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0F1A2E]/98 backdrop-blur-md border-t border-white/10">
          <nav className="flex flex-col px-4 py-4 gap-3 text-white/80 text-sm">
            {[
              { href: "#servicios", label: "Servicios" },
              { href: "#cobertura", label: "Cobertura" },
              { href: "#nosotros", label: "Nosotros" },
              { href: "#presupuesto", label: "Contacto" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="py-2 hover:text-[#C9A84C] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <a
              href="#presupuesto"
              className="mt-2 bg-[#C9A84C] text-[#0F1A2E] font-semibold px-4 py-2 rounded text-center"
              onClick={() => setMenuOpen(false)}
            >
              Pedir presupuesto
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
