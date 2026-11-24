"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ── Section key map ─────────────────────────────────────────────────────────
export const SECTION_KEYS: Record<string, string> = {
  v: "/admin/viajes",
  c: "/admin/clientes",
  f: "/admin/facturas",
  e: "/admin/empleados",
  g: "/admin/gastos",
  p: "/admin/pagos",
  u: "/admin/usuarios",
  d: "/admin/documentos",
  h: "/admin",
};

// ── Context shared between the global hook and list components ───────────────
interface AdminKeyboardCtx {
  /** Call from a list page to register its rows and new-item handler */
  registerList: (items: ListItem[], onNew: () => void) => void;
  unregisterList: () => void;
  /** Currently highlighted row id (for styling) */
  activeId: string | null;
  /** Whether the help panel is open */
  helpOpen: boolean;
  setHelpOpen: (v: boolean) => void;
}

export interface ListItem {
  id: string;
  href: string;
}

const noop = () => {};

export const AdminKeyboardContext = createContext<AdminKeyboardCtx>({
  registerList: noop,
  unregisterList: noop,
  activeId: null,
  helpOpen: false,
  setHelpOpen: noop,
});

export function useAdminKeyboardContext() {
  return useContext(AdminKeyboardContext);
}

// ── Provider hook — mount once in the admin layout ───────────────────────────
export function useAdminKeyboard() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Mutable refs so the keydown handler always sees the latest values
  const listRef = useRef<ListItem[]>([]);
  const onNewRef = useRef<() => void>(noop);
  const activeIdxRef = useRef<number>(-1);

  const registerList = useCallback((items: ListItem[], onNew: () => void) => {
    listRef.current = items;
    onNewRef.current = onNew;
    activeIdxRef.current = -1;
    setActiveId(null);
  }, []);

  const unregisterList = useCallback(() => {
    listRef.current = [];
    onNewRef.current = noop;
    activeIdxRef.current = -1;
    setActiveId(null);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      const editable = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) ||
        (e.target as HTMLElement)?.isContentEditable;
      if (editable) return;

      const key = e.key.toLowerCase();

      // ? — help panel
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }

      // Escape — close help or deselect
      if (e.key === "Escape") {
        if (helpOpen) { setHelpOpen(false); return; }
        activeIdxRef.current = -1;
        setActiveId(null);
        return;
      }

      // Section navigation
      if (SECTION_KEYS[key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        router.push(SECTION_KEYS[key]);
        return;
      }

      const list = listRef.current;

      // Arrow up/down
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!list.length) return;
        e.preventDefault();
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const next = Math.max(0, Math.min(list.length - 1, activeIdxRef.current + delta));
        activeIdxRef.current = next;
        setActiveId(list[next].id);
        return;
      }

      // Enter — open active item
      if (e.key === "Enter") {
        const idx = activeIdxRef.current;
        if (idx >= 0 && list[idx]) {
          e.preventDefault();
          router.push(list[idx].href);
        }
        return;
      }

      // N — new item
      if (key === "n") {
        e.preventDefault();
        onNewRef.current();
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, helpOpen]);

  return { registerList, unregisterList, activeId, helpOpen, setHelpOpen };
}
