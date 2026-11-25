import type { TSeriesKey } from "@/types";

export const CHART_VARIABLE_ORDER: readonly TSeriesKey[] = ["tmax", "tavg", "tmin", "prec"];

export const MONTHLY_TABLE = {
  WALTER_LIETH_VARIABLES: ["tavg", "prec"] satisfies TSeriesKey[],
  UNITS: { tmax: "°C", tavg: "°C", tmin: "°C", prec: "mm" } satisfies Record<TSeriesKey, string>,
  SERIES_SEPARATOR: " — ",
  NAMES_SEPARATOR: ", ",
} as const;
