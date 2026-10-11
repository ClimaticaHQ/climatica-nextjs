export const CELL_SIZES = {
  TEN_MINUTES: "10m",
  FIVE_MINUTES: "5m",
  TWO_POINT_FIVE_MINUTES: "2.5m",
  THIRTY_SECONDS: "30s",
} as const;

export const CELL_SIZE_OPTIONS = {
  [CELL_SIZES.TEN_MINUTES]: "10 min (~324 km²)",
  [CELL_SIZES.FIVE_MINUTES]: "5 min (~81 km²)",
  [CELL_SIZES.TWO_POINT_FIVE_MINUTES]: "2.5 min (~20.25 km²)",
  [CELL_SIZES.THIRTY_SECONDS]: "30 sec (~1 km²)",
} as const;

export const CLIMATE_PERIODS = {
  C1951_1980: "c1951-1980",
  C1961_1990: "c1961-1990",
  C1970_2000: "c1970-2000",
  C1981_2010: "c1981-2010",
  C1991_2020: "c1991-2020",
} as const;

export type TClimatePeriod = (typeof CLIMATE_PERIODS)[keyof typeof CLIMATE_PERIODS];

export const CLIMATE_PERIOD_LABELS: Record<TClimatePeriod, string> = {
  "c1951-1980": "1951–1980",
  "c1961-1990": "1961–1990",
  "c1970-2000": "1970–2000",
  "c1981-2010": "1981–2010",
  "c1991-2020": "1991–2020",
};

// * each normals period's first year — orders periods (the comparison's later − earlier)
export const CLIMATE_PERIOD_START_YEAR: Record<TClimatePeriod, number> = {
  "c1951-1980": 1951,
  "c1961-1990": 1961,
  "c1970-2000": 1970,
  "c1981-2010": 1981,
  "c1991-2020": 1991,
};

/** tavg isn't one of them: it's derived as (tmax + tmin) / 2. */
export const CLIMATE_VARIABLES = ["tmax", "tmin", "prec", "srad", "wind", "vapr"] as const;

/** weather dataset only has these 3 variables */
export const WEATHER_VARIABLES = ["tmax", "tmin", "prec"] as const;

// * what a heat map region's climate profile averages
export const REGIONAL_PROFILE_VARIABLES = WEATHER_VARIABLES;

/** only available in the c1970-2000 climate period */
export const PERIOD_RESTRICTED_VARIABLES = ["srad", "wind", "vapr"] as const;

export type TClimateVariable = (typeof CLIMATE_VARIABLES)[number];
export type TWeatherVariable = (typeof WEATHER_VARIABLES)[number];
export type TVariable = TClimateVariable | TWeatherVariable;

export const VARIABLE_LABELS: Record<TVariable, string> = {
  tmax: "Max temp",
  tmin: "Min temp",
  prec: "Precip",
  srad: "Solar rad",
  wind: "Wind",
  vapr: "Vapor",
};

export const VARIABLE_UNITS: Record<TVariable, string> = {
  tmax: "°C",
  tmin: "°C",
  prec: "mm",
  srad: "kJ m⁻² day⁻¹",
  wind: "m/s",
  vapr: "kPa",
};

export const WEATHER_MIN_YEAR = 1951;
export const WEATHER_MAX_YEAR = 2024;

export const GRID_DELTA: Record<string, number> = {
  "10m": 10 / 60,
  "5m": 5 / 60,
  "2.5m": 2.5 / 60,
  "30s": 30 / 3600,
};

// * finest first: the first a heat map region fits in is the one to suggest
export const GRIDS_FINEST_FIRST = [
  CELL_SIZES.THIRTY_SECONDS,
  CELL_SIZES.TWO_POINT_FIVE_MINUTES,
  CELL_SIZES.FIVE_MINUTES,
  CELL_SIZES.TEN_MINUTES,
] as const;

// * WorldClim answers a region query with at most this many rows, whatever its `limit`; past
// * it, `offset` paging repeats and skips rows (the queries have no ORDER BY), so a larger
// * region is split into strips that each fit
export const WORLDCLIM_MAX_ROWS = 10_000;

// * inner strip edges are grid lines, rounded: the same region always asks for the same strips
export const REGION_STRIP_EDGE_DECIMALS = 6;

// * region queries the proxy caches in Redis, each strip under its own query string
export const WORLDCLIM_CACHED_QUERY_IDS: readonly string[] = [
  "pixelvaluesinbox",
  "avgpixelvaluesinbox",
  "avgpixelvaluesinpolygonGEO",
];

export const CELL_IRI_ROW_COL_REGEX = /Cell_[^_]+_r(\d+)c(\d+)/;
// * ~1 m at the equator: far finer than any grid cell, and short in query and share URLs
export const WKT_COORDINATE_PRECISION = 5;
export const WKT_POINT_REGEX = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g;
