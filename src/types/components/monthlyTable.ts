import type { TMonthlyTemperatureWithAvg } from "../domain";
import type { TChartMode, TSeriesKey, TVisibleSeries } from "./chart";
import type { TSeriesHatch, TSeriesShape } from "../charts/seriesShape.type";

export type TMonthlyTableMarker = {
  shape: TSeriesShape;
  color: string;
  hatch?: TSeriesHatch;
  fill?: string;
};

export type TMonthlyTableSeries = {
  key: string;
  label?: string | undefined;
  marker?: TMonthlyTableMarker | undefined;
  data: readonly TMonthlyTemperatureWithAvg[];
};

export type TMonthlyTableLabels = Record<TSeriesKey, string>;

export type TMonthlyTableRow = {
  key: string;
  variable: TSeriesKey;
  variableLabel: string;
  unit: string;
  seriesLabel?: string | undefined;
  marker?: TMonthlyTableMarker | undefined;
  values: string[];
};

export type TMonthlyTableRowsArgs = {
  series: readonly TMonthlyTableSeries[];
  variables: readonly TSeriesKey[];
  labels: TMonthlyTableLabels;
  locale: string;
};

export type TFormatMonthlyValueArgs = {
  variable: TSeriesKey;
  value: number | null;
  locale: string;
};

export type TMonthlyTableVariablesArgs = {
  chartMode: TChartMode;
  visible: TVisibleSeries;
};
