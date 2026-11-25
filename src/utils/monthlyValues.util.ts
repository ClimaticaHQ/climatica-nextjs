import { MONTHLY_VALUES, SERIES_DISPLAY_METRIC } from "@/constants";
import { ENumberSign } from "@/enums";
import type {
  TFormatMonthlyValuesValueArgs,
  TMonthlyValuesRow,
  TMonthlyValuesRowsArgs,
} from "@/types";
import { formatValue } from "./displayFormat.util";

export function formatMonthlyValuesValue({
  variable,
  value,
  locale,
}: TFormatMonthlyValuesValueArgs) {
  return formatValue(value, {
    metric: SERIES_DISPLAY_METRIC[variable],
    locale,
    sign: ENumberSign.MINUS,
  });
}

export function buildMonthlyValuesRows({
  series,
  palette,
  names,
  locale,
}: TMonthlyValuesRowsArgs): TMonthlyValuesRow[] {
  const monthCount = Math.max(0, ...series.map(({ data }) => data.length));
  return MONTHLY_VALUES.VARIABLES.map((variable) => ({
    variable,
    unit: MONTHLY_VALUES.UNITS[variable],
    unitColor: variable === "prec" ? palette.prec : palette.temp,
    name: names[variable],
    cells: Array.from({ length: monthCount }, (_, month) =>
      series.map(({ key, label, data }) => {
        const text = formatMonthlyValuesValue({ variable, value: data[month]?.[variable], locale });
        return {
          key,
          text,
          color: palette.text,
          srText: `${label}${MONTHLY_VALUES.SR_SEPARATOR}${text}`,
        };
      }),
    ),
  }));
}
