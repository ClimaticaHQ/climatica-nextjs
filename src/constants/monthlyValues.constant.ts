import type { TMonthlyValuesVariable } from "@/types";

export const MONTHLY_VALUES = {
  VARIABLES: ["tavg", "prec"] satisfies TMonthlyValuesVariable[],
  UNITS: { tavg: "°C", prec: "mm" } satisfies Record<TMonthlyValuesVariable, string>,
  SR_SEPARATOR: ": ",
} as const;
