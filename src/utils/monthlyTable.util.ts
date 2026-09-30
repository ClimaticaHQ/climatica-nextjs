import { CHART_VARIABLE_ORDER, MONTHLY_TABLE } from "@/constants";
import type {
  TFormatMonthlyValueArgs,
  TMonthlyTableRow,
  TMonthlyTableRowsArgs,
  TMonthlyTableVariablesArgs,
  TSeriesKey,
} from "@/types";
import { formatNumber } from "./numberFormat.util";

/** A monthly value as the table shows it: fixed decimals per variable, "—" when missing. */
export function formatMonthlyValue({ variable, value, locale }: TFormatMonthlyValueArgs) {
  return formatNumber(value, { locale, digits: MONTHLY_TABLE.DECIMALS[variable] });
}

/** The variables the table lists: WL's mean temperature and precipitation, or the chips. */
export function getMonthlyTableVariables({
  chartMode,
  visible,
}: TMonthlyTableVariablesArgs): readonly TSeriesKey[] {
  return chartMode === "walter-lieth"
    ? MONTHLY_TABLE.WALTER_LIETH_VARIABLES
    : CHART_VARIABLE_ORDER.filter((key) => visible[key]);
}

/**
 * The monthly table's rows, grouped by variable: each variable once per series (Avg Temp — A,
 * Avg Temp — B, Precip — A, …). The screen table and the export draw exactly these rows.
 */
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

/** A row's full label: the variable with its unit, then the series when there is one. */
export function getMonthlyTableRowLabel({ variableLabel, unit, seriesLabel }: TMonthlyTableRow) {
  const label = `${variableLabel} (${unit})`;
  return seriesLabel !== undefined
    ? `${label}${MONTHLY_TABLE.SERIES_SEPARATOR}${seriesLabel}`
    : label;
}
