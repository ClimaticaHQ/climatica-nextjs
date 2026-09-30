import type { TComparisonExport } from "./walterLiethExport.type";
import type { TExportChartColors } from "./shared.type";
import type {
  TCompareStats,
  TDatasetAttribution,
  TMonthlyTableLabels,
  TMonthlyTemperatureWithAvg,
  TSeriesKey,
  TVisibleSeries,
  TWalterLiethScales,
} from "@/types";

export type TCompareExportSeriesColors = Record<TSeriesKey, string>;

/** One column of a comparison export — a city, a climate period, or a weather
 * year. One builder renders 2..N of these uniformly. */
export type TCompareExportSeries = {
  label: string;
  data: TMonthlyTemperatureWithAvg[];
  stats: TCompareStats;
  altitude: number | null;
  martonneClassLabel: string | null;
  colors: TCompareExportSeriesColors;
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
  /** Multi-period mode never draws a tavg line — the others draw all three. */
  showTavgLine: boolean;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  /** two-series comparisons: WL panels or standard split panels replace the standard body */
  comparison?: TComparisonExport;
};

/** Pixel geometry of the standard compare chart body. */

/** The standard split export's legend: both series' colors, or the expanded panel's. */
export type TStandardSplitLegendArgs = {
  payload: TCompareExportPayload;
  comparison: TComparisonExport;
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
