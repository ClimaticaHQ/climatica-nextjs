"use client";

import type { TConsentBannerState } from "@/types";
import { create } from "zustand";

export const useConsentBannerStore = create<TConsentBannerState>()((set) => ({
  isReopened: false,
  reopen: () => set({ isReopened: true }),
  close: () => set({ isReopened: false }),
}));
