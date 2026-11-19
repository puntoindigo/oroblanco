"use client";

import { useState, useEffect, useRef } from "react";

type Cliente = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string | null;
  tel: string | null;
  cuit: string | null;
};

type Props = {
  value: string | null;    // clienteId seleccionado
  clienteNombre?: string;  // nombre actual (para mostrar en el badge)
  onChange: (clienteId: string | null, cliente: Cliente | null) => void;
};

export default function ClienteCombobox({ value, clienteNombre, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ nombre: "", empresa: "", email: "", tel: "", cuit: "" });
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/clientes?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  async function createCliente() {
    if (!newForm.nombre.trim()) return;
    setSaving(true);
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    const cliente = await res.json();
    setSaving(false);
    setShowNew(false);
    setOpen(false);
    setQuery("");
    onChange(cliente.id, cliente);
  }

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex-1 bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm text-blue-900 font-medium">
          {clienteNombre ?? value}
        </span>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2"
        >
          ✕ cambiar
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        placeholder="Buscar cliente por nombre o empresa..."
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
      />

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-72 overflow-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-400">Buscando…</div>
          )}

          {!loading && results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id, c); setOpen(false); setQuery(""); }}
              className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="text-sm font-medium text-gray-900">{c.nombre}</div>
              {c.empresa && <div className="text-xs text-gray-500">{c.empresa}</div>}
            </button>
          ))}

          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">
              {query ? "Sin resultados" : "Escribí para buscar"}
            </div>
          )}

          {!showNew && (
            <button
              type="button"
              onClick={() => { setShowNew(true); setNewForm({ nombre: query, empresa: "", email: "", tel: "", cuit: "" }); }}
              className="w-full text-left px-3 py-2.5 text-sm text-[#1E3A5F] font-medium hover:bg-blue-50 border-t border-gray-100 flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Crear cliente nuevo
            </button>
          )}

          {showNew && (
            <div className="p-3 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-gray-600 mb-1">Nuevo cliente</p>
              <input
                autoFocus
                type="text"
                placeholder="Nombre *"
                value={newForm.nombre}
                onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={newForm.empresa}
                onChange={(e) => setNewForm({ ...newForm, empresa: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={newForm.tel}
                  onChange={(e) => setNewForm({ ...newForm, tel: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
                <input
                  type="text"
                  placeholder="CUIT"
                  value={newForm.cuit}
                  onChange={(e) => setNewForm({ ...newForm, cuit: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="flex-1 border border-gray-200 text-gray-500 py-1.5 rounded text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={createCliente}
                  disabled={saving || !newForm.nombre.trim()}
                  className="flex-1 bg-[#0F1A2E] text-white py-1.5 rounded text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Guardando…" : "Crear"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
