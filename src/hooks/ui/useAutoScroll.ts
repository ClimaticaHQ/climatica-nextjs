"use client";

import { LOCAL_STORAGE_KEYS } from "@/constants";
import { create } from "zustand";

type TAutoScrollState = {
  autoScroll: boolean;
  toggleAutoScroll: () => void;
};

function loadAutoScroll(): boolean {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTO_SCROLL);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

function saveAutoScroll(value: boolean) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTO_SCROLL, String(value));
  } catch {
    return;
  }
}

const autoScrollStore = create<TAutoScrollState>()((set, get) => ({
  autoScroll: loadAutoScroll(),
  toggleAutoScroll: () => {
    const next = !get().autoScroll;
    set({ autoScroll: next });
    saveAutoScroll(next);
  },
}));

export function useAutoScroll() {
  const { autoScroll, toggleAutoScroll } = autoScrollStore();
  return { autoScroll, toggleAutoScroll } as const;
}
