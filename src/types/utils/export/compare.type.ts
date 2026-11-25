import type { TRowHeaders } from "./shared.type";
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

export type TCompareExportSeries = {
  label: string;
  shortLabel: string;
  data: TMonthlyTemperatureWithAvg[];
  stats: TCompareStats;
  altitude: number | null;
  martonneClassLabel: string | null;
  shape: TSeriesShape;
  hatch: TSeriesHatch;
  place: number;
};

export type TCompareExportStatsRow = {
  label: string;
  format: (series: TCompareExportSeries) => string;
};

export type TCompareExportLabels = {
  locale: string;
  monthNames: string[];
  tableLabels: TMonthlyTableLabels;
  seriesLabels: Record<TSeriesKey, string>;
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

export type TCompareExportPayload = {
  headerTitle: string;
  headerSubtitle: string;
  series: TCompareExportSeries[];
  visibleSeries: TVisibleSeries;
  selectedMonths: number[] | null;
  scales: TWalterLiethScales;
  rightMax: number;
  labels: TCompareExportLabels;
  showTavgLine: boolean;
  barStyle: TBarStyle;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
  comparison?: TComparisonExport;
  weatherYears?: TWeatherYearsExport;
};

export type TStandardSplitLegendArgs = {
  payload: TCompareExportPayload;
  colors: TExportChartColors;
  y: number;
};

export type TOverlayValuesArgs = {
  payload: TCompareExportPayload;
  colors: TExportChartColors;
  plotLeft: number;
  plotRight: number;
  chartBottom: number;
  rowHeaders: TRowHeaders;
};

export type TGroupedBarsArgs = {
  seriesList?: readonly TCompareExportSeries[];
  barStyle?: TBarStyle;
  hatchPrefix?: string;
};

export type TSeriesLinesArgs = {
  payload: TCompareExportPayload;
  series: TCompareExportSeries;
  colors: TExportChartColors;
  tempScale: TLinearScale;
  monthBands: TMonthBand[];
  dash?: TLineDash;
  hasShapes?: boolean;
  pointOffset?: number;
};
