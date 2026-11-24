"use client";

import { useMemo } from "react";
import { AdminKeyboardContext, useAdminKeyboard, SECTION_KEYS } from "@/lib/hooks/useAdminKeyboard";
import AdminKeyboardHelp from "./AdminKeyboardHelp";

export default function AdminKeyboardProvider({ children }: { children: React.ReactNode }) {
  const { registerList, unregisterList, activeId, helpOpen, setHelpOpen } = useAdminKeyboard();

  const ctx = useMemo(
    () => ({ registerList, unregisterList, activeId, helpOpen, setHelpOpen }),
    [registerList, unregisterList, activeId, helpOpen, setHelpOpen]
  );

  return (
    <AdminKeyboardContext.Provider value={ctx}>
      {children}
      {helpOpen && <AdminKeyboardHelp onClose={() => setHelpOpen(false)} />}
    </AdminKeyboardContext.Provider>
  );
}
