import type {
  TCompareStats,
  TDatasetAttribution,
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
  monthNames: string[];
  monthAxisLabel: string;
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
};
