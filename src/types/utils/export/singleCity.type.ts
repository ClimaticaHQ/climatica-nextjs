import type {
  TCellSize,
  TChartMode,
  TChartSubtitle,
  TChartSummary,
  TDatasetAttribution,
  TLocale,
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

export type TExportMonthlyRow = TMonthlyTemperature & { tavg: number };

/** All labels reuse existing i18n keys — none were added for export. */
export type TExportLabels = {
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
  tableLabels: {
    avgTemp: string;
    precip: string;
  };
  monthAxisLabel: string;
  /** Omitted when summary.martonne is null. */
  martonneClassLabel?: string;
  aridityLegend: {
    arid: string;
    humid: string;
  };
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
  locale: TLocale;
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
};

/** Narrows rawData from optional to required — guarantees the lazy fetch ran
 * before a raw CSV/JSON export, instead of a redundant runtime null-check. */
export type TExportPayloadWithRawData = TExportPayload & { rawData: TExportRawData };
