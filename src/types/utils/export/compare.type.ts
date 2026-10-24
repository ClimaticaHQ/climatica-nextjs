import type { TComparisonExport, TWeatherYearsExport } from "./walterLiethExport.type";
import type { TExportChartColors, TLinearScale, TMonthBand } from "./shared.type";
import type {
  TCompareStats,
  TDatasetAttribution,
  TMonthlyTableLabels,
  TMonthlyTemperatureWithAvg,
  TAridityLegendLabels,
  TBarStyle,
  TLineDash,
  TSeriesKey,
  TSeriesShape,
  TSeriesHatch,
  TVisibleSeries,
  TWalterLiethScales,
} from "@/types";

/** One column of a comparison export — a city, a climate period, or a weather
 * year. One builder renders 2..N of these uniformly. */
export type TCompareExportSeries = {
  label: string;
  /** its values-table row header: 1967, ’70–’00, MAD (getEntityShortLabels) */
  shortLabel: string;
  data: TMonthlyTemperatureWithAvg[];
  stats: TCompareStats;
  altitude: number | null;
  martonneClassLabel: string | null;
  /** its marker shape: its points, its table rows */
  shape: TSeriesShape;
  /** its overlay bars' hatch */
  hatch: TSeriesHatch;
  /** its place among the compared series, as on screen: with shades, its bars' step */
  place: number;
};

export type TCompareExportStatsRow = {
  label: string;
  format: (series: TCompareExportSeries) => string;
};

export type TCompareExportLabels = {
  /** the UI's locale — the export's numbers read as on screen */
  locale: string;
  monthNames: string[];
  /** the monthly table's variable labels with units — the screen table's */
  tableLabels: TMonthlyTableLabels;
  seriesLabels: Record<TSeriesKey, string>;
  /** the bars' humid / arid fills, as the legend names them */
  aridityLegend: TAridityLegendLabels;
  statsLabels: {
    avgTmax: string;
    avgTmin: string;
    totalPrec: string;
    aridMonths: string;
    altitude: string;
    martonne: string;
  };
};

/** Shared by compare-cities, compare-periods climate mode (2 series) and
 * compare-periods weather mode (up to 5 series). */
export type TCompareExportPayload = {
  headerTitle: string;
  headerSubtitle: string;
  series: TCompareExportSeries[];
  visibleSeries: TVisibleSeries;
  selectedMonths: number[] | null;
  scales: TWalterLiethScales;
  rightMax: number;
  labels: TCompareExportLabels;
  /** whether the chart draws a mean temperature line */
  showTavgLine: boolean;
  /** the standard overlay's bars, legend and table: EXPORT_BAR_STYLE from the page */
  barStyle: TBarStyle;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  /** two-series comparisons: WL panels or standard split panels replace the standard body */
  comparison?: TComparisonExport;
  /** Compare Periods with weather years: what the screen draws (pair or shown years) */
  weatherYears?: TWeatherYearsExport;
};

/** The standard split export's legend: the semantic colours every panel shares. */
export type TStandardSplitLegendArgs = {
  payload: TCompareExportPayload;
  colors: TExportChartColors;
  /** top of the legend block */
  y: number;
};

/** The standard overlay's values table under its plot. */
export type TOverlayValuesArgs = {
  payload: TCompareExportPayload;
  colors: TExportChartColors;
  plotLeft: number;
  plotRight: number;
  chartBottom: number;
};

export type TGroupedBarsArgs = {
  /** a split panel draws one series' bars; the overlay every series' */
  seriesList?: readonly TCompareExportSeries[];
  /** the overlay: its bar style — the bars' gap, fills and hatch */
  barStyle?: TBarStyle;
  /** the overlay's hatch patterns' id prefix: with the hatch style, each bar its series' hatch */
  hatchPrefix?: string;
};

/** One series' lines: its points in its shape (the overlay), or circles (a split panel). */
export type TSeriesLinesArgs = {
  payload: TCompareExportPayload;
  series: TCompareExportSeries;
  colors: TExportChartColors;
  tempScale: TLinearScale;
  monthBands: TMonthBand[];
  dash?: TLineDash;
  /** the overlay: each point in the series' shape */
  hasShapes?: boolean;
  /** the overlay: its points over its own bar — the bar's offset from the month's centre (px) */
  pointOffset?: number;
};
