"use client";

import type { TConsentBannerState } from "@/types";
import { create } from "zustand";

/** Cookie settings opening the consent banner again, from anywhere in the app. */
export const useConsentBannerStore = create<TConsentBannerState>()((set) => ({
  isReopened: false,
  reopen: () => set({ isReopened: true }),
  close: () => set({ isReopened: false }),
}));
