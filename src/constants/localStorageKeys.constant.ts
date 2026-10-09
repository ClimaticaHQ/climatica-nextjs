export const LOCAL_STORAGE_KEYS = {
  COMPARE_CITY_A: "climatica:compareCityA",
  COMPARE_CITY_B: "climatica:compareCityB",

  SETTINGS: "climatica:settings",

  HEATMAP_BBOX: "climatica:heatmapBbox",
  LAST_SELECTED_CITY: "climatica:lastSelectedCity",
  LANGUAGE: "climatica:lang",
  THEME: "climatica:theme",
  // * each page's own params, last seen — read only by navbar links
  LAST_PAGE_PARAMS: "climatica:lastPageParams",
} as const;

// * filters used to be kept here; the URL holds them now — removed on load
export const LEGACY_FILTER_STORAGE_KEYS = [
  "climatica:filters",
  "climatica:comparePeriods",
  "climatica:compareClimatePeriods",
] as const;

// * where older versions saved the theme — moved to LOCAL_STORAGE_KEYS.THEME on load, then removed
export const LEGACY_THEME_STORAGE_KEY = "theme";
