import { MONTHLY_VALUES, SERIES_DISPLAY_METRIC } from "@/constants";
import { ENumberSign } from "@/enums";
import type {
  TFormatMonthlyValuesValueArgs,
  TMonthlyValuesRow,
  TMonthlyValuesRowsArgs,
} from "@/types";
import { formatValue } from "./displayFormat.util";

/** A table value: temperature to one decimal with a real minus, precipitation whole, or "—". */
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

/**
 * The monthly values table's two rows — mean temperature and precipitation — with, per month,
 * one entry per series (overlay: A above B), each in the text colour — the series show by shape. The screen
 * and the export draw these rows.
 */
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
