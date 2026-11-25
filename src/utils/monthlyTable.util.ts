import { CHART_VARIABLE_ORDER, MONTHLY_TABLE, SERIES_DISPLAY_METRIC } from "@/constants";
import type {
  TFormatMonthlyValueArgs,
  TMonthlyTableRow,
  TMonthlyTableRowsArgs,
  TMonthlyTableVariablesArgs,
  TSeriesKey,
} from "@/types";
import { formatValue } from "./displayFormat.util";

export function formatMonthlyValue({ variable, value, locale }: TFormatMonthlyValueArgs) {
  return formatValue(value, { metric: SERIES_DISPLAY_METRIC[variable], locale });
}

export function getMonthlyTableVariables({
  chartMode,
  visible,
}: TMonthlyTableVariablesArgs): readonly TSeriesKey[] {
  return chartMode === "walter-lieth"
    ? MONTHLY_TABLE.WALTER_LIETH_VARIABLES
    : CHART_VARIABLE_ORDER.filter((key) => visible[key]);
}

export function buildMonthlyTableRows({
  series,
  variables,
  labels,
  locale,
}: TMonthlyTableRowsArgs): TMonthlyTableRow[] {
  return variables.flatMap((variable) =>
    series.map(({ key, label, marker, data }) => ({
      key: `${variable}-${key}`,
      variable,
      variableLabel: labels[variable],
      unit: MONTHLY_TABLE.UNITS[variable],
      seriesLabel: label,
      marker,
      values: data.map((month) => formatMonthlyValue({ variable, value: month[variable], locale })),
    })),
  );
}

export function getMonthlyTableRowLabel({ variableLabel, unit, seriesLabel }: TMonthlyTableRow) {
  const label = `${variableLabel} (${unit})`;
  return seriesLabel !== undefined
    ? `${label}${MONTHLY_TABLE.SERIES_SEPARATOR}${seriesLabel}`
    : label;
}
