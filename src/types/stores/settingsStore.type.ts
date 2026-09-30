import type { EUpdateFlashVariant } from "@/enums";

export type TSettingsState = {
  autoScroll: boolean;
  autoApplyFilters: boolean;
  syncCity: boolean;
  /** UI motion on / off — prefers-reduced-motion still wins when on */
  animationsEnabled: boolean;
  updateFlashVariant: EUpdateFlashVariant;
  hasHydrated: boolean;
  toggleAutoScroll: () => void;
  toggleAutoApplyFilters: () => void;
  toggleSyncCity: () => void;
  toggleAnimations: () => void;
  setUpdateFlashVariant: (variant: EUpdateFlashVariant) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

/** The settings kept in localStorage. */
export type TPersistedSettings = Pick<
  TSettingsState,
  "autoScroll" | "autoApplyFilters" | "syncCity" | "animationsEnabled" | "updateFlashVariant"
>;
