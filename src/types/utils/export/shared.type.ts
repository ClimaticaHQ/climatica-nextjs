import type {
  TComparisonTable,
  TComparisonTableLabels,
  TComparisonTableValue,
} from "../../components/comparisonTable";
import type { TMonthlyValuesRow, TMonthlyValuesSeries } from "../../components/monthlyValues";
import type { TMonthlyTableRow } from "../../components/monthlyTable";

export type TExportChartColors = {
  text: string;
  textSecondary: string;
  border: string;
  bg: string;
  /** the comparison table's header row */
  bgSecondary: string;
  tmax: string;
  tmin: string;
  tavg: string;
  arid: string;
  humid: string;
  /** Only the heat-map export's selection outline uses this. */
  primary: string;
  /** Walter-Lieth convention colors — resolved from the same CSS vars the live diagram uses. */
  wlTemp: string;
  wlPrec: string;
  wlHumidHatch: string;
  wlAridHatch: string;
  wlCompressedFill: string;
  wlFrost: string;
  wlFrostOutline: string;
  /** WL overlay series identity (A green, B orange) */
  wlSeriesA: string;
  wlSeriesB: string;
};

/** Axis placement for buildGridAndAxes — WL panels put °C / mm above the axes. */
export type TGridAxesStyle = {
  tickGap: number;
  /** offset of °C / mm above the plot top */
  unitTitlesAbove: number;
};

export type TUnitTitlesArgs = {
  plotLeft: number;
  plotRight: number;
  chartTop: number;
  colors: TExportChartColors;
  axesStyle: TGridAxesStyle;
};

export type TLinearScale = (value: number) => number;

export type TMonthBand = {
  x: number;
  width: number;
  center: number;
};

export type TSvgToPngParams = {
  svg: string;
  width: number;
  height: number;
  scale?: number;
  filename: string;
};

/** Height is derived from how many lines the footer actually wrapped to. */
export type TSvgExportResult = {
  svg: string;
  height: number;
};

export type TExportPoint = {
  x: number;
  y: number;
};

/** A monthly table in an export: its rows (shared with the screen table), where it goes. */
export type TExportMonthlyTableArgs = {
  rows: readonly TMonthlyTableRow[];
  monthNames: readonly string[];
  top: number;
  left: number;
  width: number;
  colors: TExportChartColors;
};

/** A plot's x span in the export — the strip's months sit exactly under it. */
export type TExportPlotSpan = {
  left: number;
  right: number;
};

export type TExportComparisonTableArgs = {
  table: TComparisonTable;
  labels: TComparisonTableLabels;
  top: number;
  left: number;
  width: number;
  colors: TExportChartColors;
};

/** One text of the export's comparison table. */
export type TExportTableCellArgs = {
  x: number;
  y: number;
  value: string;
  anchor: "start" | "end";
  size: number;
  weight?: number | undefined;
  fill: string;
};

/** A comparison-table value: right-aligned, with its Martonne badge (translated) before it. */
export type TExportTableValueArgs = {
  value: TComparisonTableValue;
  badgeText: string | null;
  cell: Omit<TExportTableCellArgs, "value" | "anchor" | "size">;
};

/** A monthly-table row's label in the export: the unit colored, cut to the label column. */
export type TExportTableRowLabelArgs = {
  row: TMonthlyTableRow;
  maxWidth: number;
  colors: TExportChartColors;
};

export type TExportMonthlyValuesArgs = {
  rows: readonly TMonthlyValuesRow[];
  span: TExportPlotSpan;
  /** the y axes' room either side of the plot — the unit labels sit in the left one */
  gutter: number;
  top: number;
  colors: TExportChartColors;
};

/** An export's monthly values rows: its series, drawn in the export palette. */
export type TExportValuesRowsArgs = {
  series: readonly TMonthlyValuesSeries[];
  colors: TExportChartColors;
  /** the UI's locale — the export shows the numbers as the screen does */
  locale: string;
};
