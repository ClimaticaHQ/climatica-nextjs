export const LOCAL_STORAGE_KEYS = {
  COMPARE_CITY_A: "climatica:compareCityA",
  COMPARE_CITY_B: "climatica:compareCityB",

  // * every user setting, one object (the settings store)
  SETTINGS: "climatica:settings",

  LAST_SELECTED_CITY: "climatica:lastSelectedCity",
  // * each page's own params, last seen — read only by navbar links
  LAST_PAGE_PARAMS: "climatica:lastPageParams",
} as const;

// * where older versions saved the theme, the newer key first — the settings store reads them
// * once (migration) and the inline theme script falls back to them until it has
export const LEGACY_THEME_STORAGE_KEYS = ["climatica:theme", "theme"] as const;

// * what older versions kept in localStorage: filters and the heat map box (the URL holds them
// * now), the theme (the settings store), an unused language key — removed on load
export const LEGACY_STORAGE_KEYS = [
  "climatica:filters",
  "climatica:comparePeriods",
  "climatica:compareClimatePeriods",
  "climatica:heatmapBbox",
  "climatica:lang",
  ...LEGACY_THEME_STORAGE_KEYS,
] as const;
