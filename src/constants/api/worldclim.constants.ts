export const WORLDCLIM_BASE_URL = "https://scrapi.gsic.uva.es/apis/worldclim";
export const WORLDCLIM_PROXY_BASE = "/api/worldclim";
export const WORLDCLIM_VARIABLE_BASE = "http://climate.gsic.uva.es/data/Variable_";
export const WORLDCLIM_GRID_BASE = "http://climate.gsic.uva.es/data/Grid_";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WORLDCLIM_VARIABLES = {
  TMIN: "tmin",
  TMAX: "tmax",
  PREC: "prec",
} as const;
