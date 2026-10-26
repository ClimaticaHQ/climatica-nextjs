"use client";

import type { TNavigationIntentState } from "@/types";
import { create } from "zustand";

/** Set by NavigationIntentTracker on an internal link click, cleared once the route changes. */
export const useNavigationIntentStore = create<TNavigationIntentState>()((set) => ({
  pendingPathname: null,
  setPendingPathname: (pendingPathname) => set({ pendingPathname }),
}));
