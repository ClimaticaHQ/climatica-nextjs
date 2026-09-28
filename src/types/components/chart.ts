import { TClimatePeriod } from "../api";
import { TDataset, TMonthlyTemperature } from "../domain";

export type TMultiPeriodEntry = { year: number; rows: TMonthlyTemperature[] };

export type TSeriesKey = "tmax" | "tmin" | "tavg" | "prec";

export type TVisibleSeries = Record<TSeriesKey, boolean>;

export type TChartSubtitle = {
  dataset?: TDataset;
  climatePeriod?: TClimatePeriod;
  weatherYear?: number;
  rawLabel?: string;
};

export type TChartMode = "standard" | "walter-lieth";

export type TShownChartModeArgs = {
  chartMode: TChartMode;
  dataset: TDataset;
};

export type TWalterLiethShownArgs = {
  pathname: string;
  searchParams: URLSearchParams;
  dataset: TDataset;
};

export type TCompareMode = "cities" | "periods";

/** Missing values are null — the chart draws a gap there, never a 0. */
export type TComparePoint = {
  month: number;
  monthName: string;
  tmaxA: number | null;
  tminA: number | null;
  tavgA: number | null;
  precA: number | null;
  tmaxB: number | null;
  tminB: number | null;
  tavgB: number | null;
  precB: number | null;
};

export type TChartSummary = {
  annualAvgTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};

/** Formatted differences shown under series B's values — a missing key shows no delta. */
export type TStatDeltas = {
  meanTemp?: string;
  annualPrecip?: string;
  aridMonths?: string;
  martonne?: string;
};

/** Intl month format for chart axis labels: "short" (Jan) or "narrow" (J). */
export type TMonthLabelFormat = "short" | "narrow";
