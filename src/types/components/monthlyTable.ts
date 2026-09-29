import type { TMonthlyTemperatureWithAvg } from "../domain";
import type { TChartMode, TSeriesKey, TVisibleSeries } from "./chart";
import type { TLegendMarkerShape } from "./legend";

/** A series' marker in the table: its dot (circle) or square, in its color. */
export type TMonthlyTableMarker = {
  shape: TLegendMarkerShape;
  color: string;
};

/** One series of the monthly table — the only one on a city page, two or more on compare. */
export type TMonthlyTableSeries = {
  key: string;
  /** omitted for a single series: its rows are labelled by variable only */
  label?: string | undefined;
  marker?: TMonthlyTableMarker | undefined;
  data: readonly TMonthlyTemperatureWithAvg[];
};

/** A variable's row label with its unit, e.g. "Avg Temp (°C)". */
export type TMonthlyTableLabels = Record<TSeriesKey, string>;

/** One table row: a variable of one series, a formatted value ("—" if missing) per month. */
export type TMonthlyTableRow = {
  key: string;
  variableLabel: string;
  seriesLabel?: string | undefined;
  marker?: TMonthlyTableMarker | undefined;
  values: string[];
};

export type TMonthlyTableRowsArgs = {
  series: readonly TMonthlyTableSeries[];
  variables: readonly TSeriesKey[];
  labels: TMonthlyTableLabels;
};

/** Which variables the table lists: the chart's own — WL's two, or the standard chart's chips. */
export type TMonthlyTableVariablesArgs = {
  chartMode: TChartMode;
  visible: TVisibleSeries;
};
