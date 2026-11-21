import type { TSeriesShape } from "../../charts/seriesShape.type";
import type { TWalterLiethScales } from "../walterLieth.type";
import type { TComparisonTable, TComparisonTableLabels } from "../../components/comparisonTable";
import type { TMonthlyValuesRow, TMonthlyValuesSeries } from "../../components/monthlyValues";
import type { TMonthlyTableMarker, TMonthlyTableRow } from "../../components/monthlyTable";

export type TExportChartColors = {
  text: string;
  textSecondary: string;
  border: string;
  bg: string;
  tmax: string;
  tmin: string;
  tavg: string;
  arid: string;
  humid: string;
  /** Only the heat-map export's selection outline uses this. */
  brand: string;
  /** Walter-Lieth convention colors — resolved from the same CSS vars the live diagram uses. */
  wlTemp: string;
  wlPrec: string;
  wlHumidHatch: string;
  wlAridHatch: string;
  wlCompressedFill: string;
  wlFrost: string;
  wlFrostOutline: string;
  /** WL overlay series identity (A green, B orange) */
  /** every entity marker's graphite: entities differ by shape */
  seriesMarker: string;
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

export type TZeroLineArgs = {
  scales: TWalterLiethScales | null;
  tempScale: TLinearScale;
  plotLeft: number;
  plotRight: number;
};

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

/** A box of the export's tables: square, unfilled, in the border colour. */
export type TExportTableFrameArgs = {
  left: number;
  top: number;
  width: number;
  height: number;
  colors: TExportChartColors;
};

/** One grid line of the export's tables. */
export type TExportTableRuleArgs = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colors: TExportChartColors;
};

/** A data column of an export table: its head (a series' shape before it), a muted column's values. */
export type TExportTableColumn = {
  label: string;
  /** a second, smaller line under the head (the difference's direction) */
  subtitle?: string;
  shape?: TSeriesShape;
  /** values in the secondary text colour (the difference) */
  isMuted?: boolean;
};

/** A row of an export table: its label, then one value per column. */
export type TExportTableRow = {
  label: string;
  cells: readonly string[];
};

export type TExportTableArgs = {
  columns: readonly TExportTableColumn[];
  rows: readonly TExportTableRow[];
  top: number;
  left: number;
  width: number;
  colors: TExportChartColors;
};

/** A monthly-table row's label in the export: the unit colored, whole. */
export type TExportTableRowLabelArgs = {
  row: TMonthlyTableRow;
  colors: TExportChartColors;
};

/** An overlay row's markers beside its unit. */
export type TExportUnitMarkersArgs = {
  row: TMonthlyValuesRow;
  markers: readonly TMonthlyTableMarker[];
  x: number;
  cy: number;
  hatchPrefix?: string | undefined;
};

export type TExportMonthlyValuesArgs = {
  rows: readonly TMonthlyValuesRow[];
  span: TExportPlotSpan;
  /** the y axes' room either side of the plot — the unit labels sit in the left one */
  gutter: number;
  top: number;
  colors: TExportChartColors;
  /** an overlay: each series' marker, in series order, beside the unit level with its values */
  markers?: readonly TMonthlyTableMarker[] | undefined;
  /** an overlay's hatch patterns: the mm row shows each series' hatch beside its shape */
  hatchPrefix?: string | undefined;
  /** the standard overlay: each row headed by its unit and these labels beside it */
  rowHeaders?: readonly string[] | undefined;
};

/** A standard overlay row's header in the export: its unit and the series' labels. */
export type TExportRowHeaderArgs = {
  row: TMonthlyValuesRow;
  labels: readonly string[];
  /** the gutter's left edge */
  left: number;
  /** the row's vertical centre */
  cy: number;
  /** the values' size — each label in its value's type */
  fontSize: number;
  colors: TExportChartColors;
};

/** An export's monthly values rows: its series, drawn in the export palette. */
export type TExportValuesRowsArgs = {
  series: readonly TMonthlyValuesSeries[];
  colors: TExportChartColors;
  /** the UI's locale — the export shows the numbers as the screen does */
  locale: string;
};

/** A series' two names for a values-table row: its full label and its short one. */
export type TRowHeaderSeries = { label: string; shortLabel: string };

export type TRowHeadersArgs = {
  series: readonly TRowHeaderSeries[];
  /** the label column's least width: the plot's own side margin */
  minGutter: number;
};

/** The values table's row headers and the label column they need. */
export type TRowHeaders = { labels: readonly string[]; gutter: number };

export type TWrapUrlArgs = {
  url: string;
  /** the most characters a line holds at the footer's size */
  maxChars: number;
};
