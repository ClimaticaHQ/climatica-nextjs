export const AUTO_RESOLUTION = {
  CLIMATE: "30s",
  WEATHER: "2.5m",
} as const;

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

/**
 * tavg excluded — derived as (tmax + tmin) / 2
 * BIO variables excluded from sidebar (reserved for advanced filter)
 */
export const CLIMATE_VARIABLES = ["tmax", "tmin", "prec", "srad", "wind", "vapr"] as const;

/** weather dataset only has these 3 variables */
export const WEATHER_VARIABLES = ["tmax", "tmin", "prec"] as const;

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

export const WEATHER_MIN_YEAR = 1951;
export const WEATHER_MAX_YEAR = 2024;

export const GRID_DELTA: Record<string, number> = {
  "10m": 10 / 60,
  "5m": 5 / 60,
  "2.5m": 2.5 / 60,
  "30s": 30 / 3600,
};
