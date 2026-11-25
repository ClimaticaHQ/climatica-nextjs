export const LOCAL_STORAGE_KEYS = {
  COMPARE_CITY_A: "climatica:compareCityA",
  COMPARE_CITY_B: "climatica:compareCityB",
  SETTINGS: "climatica:settings",
  LAST_SELECTED_CITY: "climatica:lastSelectedCity",
  LAST_PAGE_PARAMS: "climatica:lastPageParams",
  ANALYTICS_CONSENT: "climatica:analyticsConsent",
} as const;

export const LEGACY_THEME_STORAGE_KEYS = ["climatica:theme", "theme"] as const;

// * what older versions kept in localStorage, removed on load
export const LEGACY_STORAGE_KEYS = [
  "climatica:filters",
  "climatica:comparePeriods",
  "climatica:compareClimatePeriods",
  "climatica:heatmapBbox",
  "climatica:lang",
  ...LEGACY_THEME_STORAGE_KEYS,
] as const;
