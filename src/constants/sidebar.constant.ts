import { TIME } from "./time.constant";

export const DATASETS = {
  CLIMATE: "climate",
  WEATHER: "weather",
} as const;

export const DEFAULT_VARIABLES = ["tmax", "tmin", "prec"] as const;

export const AUTO_APPLY_DEBOUNCE_MS = TIME.IN_MILLISECONDS.SECOND / 5;

export const SIDEBAR_PARAMS = {
  DATASET: "dataset",
  YEAR_START: "yearStart",
  YEAR_END: "yearEnd",
  VARIABLES: "variables",
  GRID: "grid",
  MONTHS: "months",
  BBOX_NORTH: "north",
  BBOX_SOUTH: "south",
  BBOX_WEST: "west",
  BBOX_EAST: "east",
  COMPARE_CITY_A: "cityA",
  COMPARE_CITY_B: "cityB",

  CITY: "city",
  LAT: "lat",
  LNG: "lng",
  LAT_A: "latA",
  LNG_A: "lngA",
  LAT_B: "latB",
  LNG_B: "lngB",
  PERIOD: "period",
  YEAR: "year",
  PERIOD_A: "period1",
  PERIOD_B: "period2",
  YEAR_A: "year1",
  YEAR_B: "year2",
  VAR: "var",
  POLYGON: "polygon",
  PERIODS: "periods",

  // * comparison layout (split | overlay), for both chart types; omitted when split, the default
  LAYOUT: "layout",
  // * legacy name of LAYOUT, from when only Walter-Lieth had layouts — still read from old links
  WL_LAYOUT: "wlLayout",
  // * chart mode: "standard"; omitted for Walter-Lieth, the default
  CHART: "chart",
  // * overlay hatching (b | none); omitted when it's series A, the default
  WL_SHADING: "wlShading",
  // * split: the panel shown across the card (a | b); omitted when both are shown, the default
  EXPANDED: "expanded",
  // * Compare Periods with weather years, side by side: the two years drawn ("2021,1990");
  // * omitted for the first two compared years, the default
  PAIR_YEARS: "pair",
  // * legacy name of PAIR_YEARS, from when only Walter-Lieth drew a pair — still read
  WL_YEARS: "wlYears",
  // * Compare Periods with weather years, overlay: the years drawn ("2021,1990"); omitted
  // * when every compared year is, the default
  SHOWN_YEARS: "shownYears",
  CHART_MODE_STANDARD: "standard",
  // * old links wrote chart=wl when standard was the default — still accepted
  CHART_MODE_WALTER_LIETH: "wl",
} as const;
