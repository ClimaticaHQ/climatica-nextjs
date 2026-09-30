import type { TMonthlyValuesVariable } from "@/types";

export const MONTHLY_VALUES = {
  // * the same two rows under every chart: mean temperature, then precipitation
  VARIABLES: ["tavg", "prec"] satisfies TMonthlyValuesVariable[],
  UNITS: { tavg: "°C", prec: "mm" } satisfies Record<TMonthlyValuesVariable, string>,
  DECIMALS: { tavg: 1, prec: 0 } satisfies Record<TMonthlyValuesVariable, number>,
  // * "Madrid: 4.0" — a stacked cell's screen-reader text per series
  SR_SEPARATOR: ": ",
} as const;
