export type TSettingsState = {
  autoScroll: boolean;
  autoApplyFilters: boolean;
  syncCity: boolean;
  hasHydrated: boolean;
  toggleAutoScroll: () => void;
  toggleAutoApplyFilters: () => void;
  toggleSyncCity: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};
