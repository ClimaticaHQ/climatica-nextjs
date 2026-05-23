export const DATASETS = {
  CLIMATE: "climate",
  WEATHER: "weather",
} as const;

export const DEFAULT_VARIABLES = ["tmax", "tmin", "prec"] as const;

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

  // * shareable URL params
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
} as const;
