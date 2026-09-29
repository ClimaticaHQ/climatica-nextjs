import { CHART_VARIABLE_ORDER, MISSING_VALUE_LABEL, MONTHLY_TABLE } from "@/constants";
import type {
  TMonthlyTableRow,
  TMonthlyTableRowsArgs,
  TMonthlyTableVariablesArgs,
  TSeriesKey,
} from "@/types";

/** A monthly value as the table shows it: fixed decimals per variable, "—" when missing. */
export function formatMonthlyValue(variable: TSeriesKey, value: number | null) {
  return value !== null ? value.toFixed(MONTHLY_TABLE.DECIMALS[variable]) : MISSING_VALUE_LABEL;
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
}: TMonthlyTableRowsArgs): TMonthlyTableRow[] {
  return variables.flatMap((variable) =>
    series.map(({ key, label, marker, data }) => ({
      key: `${variable}-${key}`,
      variableLabel: labels[variable],
      seriesLabel: label,
      marker,
      values: data.map((month) => formatMonthlyValue(variable, month[variable])),
    })),
  );
}

/** A row's full label: the variable, then the series when there is one. */
export function getMonthlyTableRowLabel({ variableLabel, seriesLabel }: TMonthlyTableRow) {
  return seriesLabel !== undefined
    ? `${variableLabel}${MONTHLY_TABLE.SERIES_SEPARATOR}${seriesLabel}`
    : variableLabel;
}
