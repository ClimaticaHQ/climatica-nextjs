import type { EDisplayMetric, EWalterLiethSeriesId } from "@/enums";
import type { TMonthlyTemperature } from "../domain";
import type { TMartonneBadge } from "../utils/martonne.type";

export type TComparisonMetric =
  | "meanTemp"
  | "avgTmax"
  | "avgTmin"
  | "annualPrec"
  | "aridMonths"
  | "frostMonths"
  | "altitude"
  | "martonne";

export type TComparisonUnit = "celsius" | "mm" | "meters";

export type TComparisonMetricFormat = {
  metric: TComparisonMetric;
  unit: TComparisonUnit | null;
  display: EDisplayMetric;
};

export type TComparisonTableSeries = {
  id: EWalterLiethSeriesId;
  label: string;
  data: readonly TMonthlyTemperature[];
  altitude: number | null;
};

export type TComparisonTableValue = {
  text: string;
  badge?: TMartonneBadge | undefined;
};

export type TComparisonTableRow = {
  metric: TComparisonMetric;
  a: TComparisonTableValue;
  b: TComparisonTableValue;
  difference: string | null;
};

export type TComparisonTable = {
  seriesA: Pick<TComparisonTableSeries, "id" | "label">;
  seriesB: Pick<TComparisonTableSeries, "id" | "label">;
  minuend: string;
  subtrahend: string;
  rows: TComparisonTableRow[];
  martonneYear?: number;
};

export type TBuildComparisonTableArgs = {
  seriesA: TComparisonTableSeries;
  seriesB: TComparisonTableSeries;
  minuend: EWalterLiethSeriesId;
  locale: string;
  martonneYear?: number | undefined;
  units: Record<TComparisonUnit, string>;
};

export type TComparisonTableLabels = {
  metrics: Record<TComparisonMetric, string>;
  difference: string;
  martonneClasses: { a: string | null; b: string | null };
};

export type TFormatComparisonValueOptions = {
  locale: string;
  unit: string | null;
};

export type TStatsTableSeries = Pick<TComparisonTableSeries, "label" | "data" | "altitude"> & {
  id: string;
  isLoading: boolean;
};

export type TBuildStatsTableArgs = {
  series: readonly TStatsTableSeries[];
  minuendId: string | null;
  locale: string;
  units: Record<TComparisonUnit, string>;
};

export type TStatsTableRow = {
  metric: TComparisonMetric;
  values: (TComparisonTableValue | null)[];
  difference: string | null;
};

export type TStatsTable = {
  columns: { id: string; label: string; isLoading: boolean }[];
  difference: { minuend: string; subtrahend: string } | null;
  rows: TStatsTableRow[];
};
