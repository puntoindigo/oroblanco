"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminKeyboardContext, type ListItem } from "./useAdminKeyboard";

/**
 * Register a list of items with the keyboard navigation system.
 * Call this from any client component that renders a navigable list.
 *
 * @param items       Array of { id, href } — same order as the visible rows
 * @param newHref     Route to push when the user presses N
 */
export function useKeyboardList(items: ListItem[], newHref: string) {
  const { registerList, unregisterList } = useAdminKeyboardContext();
  const router = useRouter();

  useEffect(() => {
    registerList(items, () => router.push(newHref));
    return () => unregisterList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((i) => i.id).join(","), newHref]);
}
