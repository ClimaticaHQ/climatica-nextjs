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
  brand: string;
  wlTemp: string;
  wlPrec: string;
  wlHumidHatch: string;
  wlAridHatch: string;
  wlCompressedFill: string;
  wlFrost: string;
  wlFrostOutline: string;
  seriesMarker: string;
};

export type TGridAxesStyle = {
  tickGap: number;
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

export type TSvgExportResult = {
  svg: string;
  height: number;
};

export type TExportPoint = {
  x: number;
  y: number;
};

export type TExportMonthlyTableArgs = {
  rows: readonly TMonthlyTableRow[];
  monthNames: readonly string[];
  top: number;
  left: number;
  width: number;
  colors: TExportChartColors;
};

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

export type TExportTableFrameArgs = {
  left: number;
  top: number;
  width: number;
  height: number;
  colors: TExportChartColors;
};

export type TExportTableRuleArgs = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  colors: TExportChartColors;
};

export type TExportTableColumn = {
  label: string;
  subtitle?: string;
  shape?: TSeriesShape;
  isMuted?: boolean;
};

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

export type TExportTableRowLabelArgs = {
  row: TMonthlyTableRow;
  colors: TExportChartColors;
};

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
  gutter: number;
  top: number;
  colors: TExportChartColors;
  markers?: readonly TMonthlyTableMarker[] | undefined;
  hatchPrefix?: string | undefined;
  rowHeaders?: readonly string[] | undefined;
};

export type TExportRowHeaderArgs = {
  row: TMonthlyValuesRow;
  labels: readonly string[];
  left: number;
  cy: number;
  fontSize: number;
  colors: TExportChartColors;
};

export type TExportValuesRowsArgs = {
  series: readonly TMonthlyValuesSeries[];
  colors: TExportChartColors;
  locale: string;
};

export type TRowHeaderSeries = { label: string; shortLabel: string };

export type TRowHeadersArgs = {
  series: readonly TRowHeaderSeries[];
  minGutter: number;
};

export type TRowHeaders = { labels: readonly string[]; gutter: number };

export type TWrapUrlArgs = {
  url: string;
  maxChars: number;
};
