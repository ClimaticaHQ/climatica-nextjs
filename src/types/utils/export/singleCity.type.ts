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

export type TExportMonthlyRow = TMonthlyTemperature & { tavg: number | null };

export type TExportLabels = {
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
  martonneClassLabel?: string;
  aridityLegend: {
    arid: string;
    humid: string;
    perhumid: string;
    frost: string;
  };
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

export type TExportPayloadWithRawData = TExportPayload & { rawData: TExportRawData };
