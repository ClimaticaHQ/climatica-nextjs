import { WEATHER_VARIABLES } from "@/constants";
import type {
  TCellSize,
  TClimatePeriod,
  TDataset,
  TMonthAridity,
  TMonthlyTemperature,
  TVariable,
  TWalterLiethScales,
} from "@/types";

export type TCsvVariable = (typeof WEATHER_VARIABLES)[number];

/** One month's readings across every SCRAPI variable, not just tmax/tmin/prec. */
export type TFullVariableMonthRow = {
  month: number;
  monthName: string;
} & Partial<Record<TVariable, number>>;

/** Lazily fetched — populated only when the user triggers the raw CSV/JSON export. */
export type TExportRawData = {
  rows: TFullVariableMonthRow[];
  variables: readonly TVariable[];
};

export type TExportLocation = {
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
};

/** Structurally matches TChartSubtitle (TempPrecipChart.type.ts) without depending on it. */
export type TExportSubtitle = {
  dataset?: TDataset;
  climatePeriod?: TClimatePeriod;
  weatherYear?: number;
  rawLabel?: string;
};

/** Structurally matches TChartSummary (TempPrecipChart.type.ts) without depending on it. */
export type TExportSummary = {
  annualAvgTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};

export type TExportMonthlyRow = TMonthlyTemperature & { tavg: number };

/** Structurally matches TVisibleSeries (TempPrecipChart.type.ts) without depending on it. */
export type TExportVisibleSeries = {
  tmax: boolean;
  tmin: boolean;
  tavg: boolean;
  prec: boolean;
};

/**
 * Every translated string buildExportSvg() needs, resolved by the caller (which has
 * useTranslations()) so the builder itself stays a pure, i18n-agnostic function.
 * All values reuse EXISTING translation keys — no new i18n keys were added for this.
 */
export type TExportLabels = {
  /** e.g. "Climate 1970–2000" / "Weather 2024" — chart.subtitle.climate / .weather */
  periodLabel: string;
  /** 12 short month labels in order — months.1..months.12 */
  monthNames: string[];
  seriesLabels: {
    tmax: string;
    tmin: string;
    tavg: string;
    prec: string;
  };
  statsLabels: {
    meanTemp: string;
    annualPrec: string;
    aridMonths: string;
    altitude: string;
    martonne: string;
  };
  /** chart.monthAxis ("Month") — °C/mm axis units are unit symbols, not translated
   *  even in the live chart (StandardClimateChart.tsx hardcodes them literally). */
  monthAxisLabel: string;
  /** martonne.arid / .semiArid / etc. — omitted when summary.martonne is null */
  martonneClassLabel?: string;
  /** chart.aridPeriod / chart.humidPeriod — matches AridityLegend.tsx exactly */
  aridityLegend: {
    arid: string;
    humid: string;
  };
};

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
};

export type TExportPayload = {
  location: TExportLocation;
  gridSize: TCellSize;
  subtitle: TExportSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TExportVisibleSeries;
  monthlyData: TExportMonthlyRow[];
  summary: TExportSummary;
  aridity: TMonthAridity[];
  scales: TWalterLiethScales;
  rightMax: number;
  labels: TExportLabels;
  rawData?: TExportRawData;
};

export type TBuildExportPayloadParams = {
  cityName: string;
  lat: number;
  lng: number;
  altitude: number | null;
  gridSize: TCellSize;
  subtitle: TExportSubtitle;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
  visibleSeries: TExportVisibleSeries | null;
  chartDataSingle: TExportMonthlyRow[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  summary: TExportSummary | null;
  rightMax: number;
  labels: TExportLabels;
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

/** Narrows TExportPayload.rawData from optional to required — the type-level
 * guarantee that exportRawCsv/exportRawJson were called only after the lazy
 * fetch populated it, instead of a redundant runtime null-check inside them. */
export type TExportPayloadWithRawData = TExportPayload & { rawData: TExportRawData };

export type TRawJsonExport = {
  city: string;
  coordinates: { lat: number; lng: number };
  altitude: number | null;
  gridSize: TCellSize;
  dataset: TDataset | null;
  climatePeriod: TClimatePeriod | null;
  weatherYear: number | null;
  variables: readonly TVariable[];
  monthly: TFullVariableMonthRow[];
};
