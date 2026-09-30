import type {
  TCellSize,
  TChartMode,
  TChartSubtitle,
  TChartSummary,
  TDatasetAttribution,
  TMonthAridity,
  TMonthlyTemperature,
  TSeriesKey,
  TVariable,
  TVisibleSeries,
  TWalterLiethScales,
} from "@/types";
import type { TExportRawData } from "./raw.type";

export type TExportLocation = {
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
};

/** tavg is null whenever tmin or tmax is missing. */
export type TExportMonthlyRow = TMonthlyTemperature & { tavg: number | null };

export type TExportLabels = {
  /** the UI's locale — the export's numbers read as on screen */
  locale: string;
  periodLabel: string;
  monthNames: string[];
  seriesLabels: Record<TSeriesKey, string>;
  statsLabels: {
    meanTemp: string;
    annualPrec: string;
    aridMonths: string;
    altitude: string;
    martonne: string;
  };
  /** Omitted when summary.martonne is null. */
  martonneClassLabel?: string;
  aridityLegend: {
    arid: string;
    humid: string;
    /** Walter-Lieth only: the solid region above 100 mm */
    perhumid: string;
    /** Walter-Lieth only: the frost band's legend entry */
    frost: string;
  };
  /** Walter-Lieth only: shown instead of the diagram when a month's data is missing */
  walterLiethIncomplete: string;
};

export type TExportPayload = {
  location: TExportLocation;
  gridSize: TCellSize;
  subtitle: TChartSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TVisibleSeries;
  monthlyData: TExportMonthlyRow[];
  summary: TChartSummary;
  aridity: TMonthAridity[];
  scales: TWalterLiethScales;
  rightMax: number;
  chartMode: TChartMode;
  labels: TExportLabels;
  shareUrl: string;
  /** Null while useGetDatasetVersion() is still loading. */
  datasetAttribution: TDatasetAttribution | null;
  rawData?: TExportRawData;
};

export type TBuildExportPayloadParams = {
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
  gridSize: TCellSize;
  subtitle: TChartSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TVisibleSeries | null;
  chartDataSingle: TExportMonthlyRow[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  summary: TChartSummary | null;
  rightMax: number;
  chartMode: TChartMode;
  labels: TExportLabels;
  datasetAttribution: TDatasetAttribution | null;
  shareUrl: string;
};

/** Narrows rawData from optional to required — guarantees the lazy fetch ran
 * before a raw CSV/JSON export, instead of a redundant runtime null-check. */
export type TExportPayloadWithRawData = TExportPayload & { rawData: TExportRawData };
