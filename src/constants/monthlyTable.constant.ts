import type { TSeriesKey } from "@/types";

// * chart variables in their display order — legend entries and table rows alike
export const CHART_VARIABLE_ORDER: readonly TSeriesKey[] = ["tmax", "tavg", "tmin", "prec"];

export const MONTHLY_TABLE = {
  // * what the WL diagram plots — its table rows, whatever the chips say
  WALTER_LIETH_VARIABLES: ["tavg", "prec"] satisfies TSeriesKey[],
  // * the city page's table: mean temperature and precipitation, as it always listed
  CITY_VARIABLES: ["tavg", "prec"] satisfies TSeriesKey[],
  UNITS: { tmax: "°C", tavg: "°C", tmin: "°C", prec: "mm" } satisfies Record<TSeriesKey, string>,
  DECIMALS: { tmax: 1, tavg: 1, tmin: 1, prec: 0 } satisfies Record<TSeriesKey, number>,
  // * between a row's variable and its series: "Avg Temp (°C) — Madrid"
  SERIES_SEPARATOR: " — ",
  // * between the series in the table's caption: "Monthly values: Madrid, Lviv"
  NAMES_SEPARATOR: ", ",
} as const;
