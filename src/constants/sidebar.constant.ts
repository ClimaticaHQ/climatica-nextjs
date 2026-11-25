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

  LAYOUT: "layout",
  WL_LAYOUT: "wlLayout",
  CHART: "chart",
  WL_SHADING: "wlShading",
  EXPANDED: "expanded",
  PAIR_YEARS: "pair",
  WL_YEARS: "wlYears",
  SHOWN_YEARS: "shownYears",
  SORT_ORDER: "order",
  MARKER_SLOTS: "markers",
  CHART_MODE_STANDARD: "standard",
  CHART_MODE_WALTER_LIETH: "wl",
} as const;
