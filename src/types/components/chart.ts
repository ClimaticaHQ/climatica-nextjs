import { TClimatePeriod } from "../api";
import { TDataset, TMonthlyTemperature } from "../domain";

export type TMultiPeriodEntry = { year: number; rows: TMonthlyTemperature[] };

export type TVisibleSeries = {
  tmax: boolean;
  tmin: boolean;
  tavg: boolean;
  prec: boolean;
};

export type TChartSubtitle = {
  dataset?: TDataset;
  climatePeriod?: TClimatePeriod;
  weatherYear?: number;
  rawLabel?: string;
};

export type TChartMode = "standard" | "walter-lieth";

export type TCompareMode = "cities" | "periods";

export type TComparePoint = {
  month: number;
  monthName: string;
  tmaxA: number;
  tminA: number;
  tavgA: number;
  precA: number;
  tmaxB: number;
  tminB: number;
  tavgB: number;
  precB: number;
};

export type TChartSummary = {
  annualAvgTemp: number;
  totalPrec: number;
  aridCount: number;
  martonne: number | null;
};
