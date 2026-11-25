"use client";

import type { TNavigationIntentState } from "@/types";
import { create } from "zustand";

export const useNavigationIntentStore = create<TNavigationIntentState>()((set) => ({
  pendingPathname: null,
  setPendingPathname: (pendingPathname) => set({ pendingPathname }),
}));
