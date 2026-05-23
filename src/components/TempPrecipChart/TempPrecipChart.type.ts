import type { TClimatePeriod } from "@/constants";
import type {
  TDataset,
  TMonthAridity,
  TMonthlyTemperature,
  TVariable,
  TWalterLiethScales,
} from "@/types";
import type { ReactNode } from "react";

export type TMonthlyTemperatureWithAvg = TMonthlyTemperature & { tavg: number };

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

export type TTempPrecipChartProps = {
  data?: TMonthlyTemperature[];
  cityName?: string;
  subtitle?: TChartSubtitle;
  altitude?: number;
  selectedMonths?: number[];
  dataA?: TMonthlyTemperature[];
  dataB?: TMonthlyTemperature[];
  labelA?: string;
  labelB?: string;
  compareMode?: TCompareMode;
  showWalterLiethToggle?: boolean;
  showAridity?: boolean;
  variables?: readonly TVariable[];
  multiPeriodData?: TMultiPeriodEntry[] | undefined;
  hiddenPeriods?: number[] | undefined;
  periodColors?: readonly string[] | undefined;
};

export type TBarShape = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  /** passed by Recharts from the data entry */
  month?: number;
  /** passed via shape={<PrecipBarShape selectedMonths={...} />} */
  selectedMonths?: readonly number[] | undefined;
  /** month → isArid lookup, passed via shape prop to avoid Cell children */
  aridityByMonth?: Record<number, boolean> | undefined;
  yAxis?: { scale?: (v: number) => number };
};

/**
 * All fields typed as T | undefined because recharts DotItemDotProps uses string | undefined
 * for some fields, and exactOptionalPropertyTypes requires explicit undefined unions.
 */
export type TDotRendererProps = {
  cx?: number | undefined;
  cy?: number | undefined;
  r?: number | string | undefined;
  fill?: string | undefined;
  stroke?: string | undefined;
  index?: number | undefined;
};

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

export type TSummaryStatsProps = {
  summary: TChartSummary;
  altitude?: number;
};

export type TModeButtonProps = {
  isActive: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
};

export type TModeToggleProps = {
  mode: TChartMode;
  onChange: (mode: TChartMode) => void;
};

export type TWLScaledPoint = {
  monthName: string;
  tavg: number;
  prec: number;
  precScaled: number;
};

export type TWalterLiethColors = {
  humidFill: string;
  aridFill: string;
  humidFillOpacity?: number;
  aridFillOpacity?: number;
  tempLineColor: string;
  precLineColor: string;
};

export type TWLCustomizedProps = {
  wlData: TWLScaledPoint[];
  wlScales: TWalterLiethScales | null;
  colors?: TWalterLiethColors;
  clipId?: string;
  opacity?: number;
  dashArray?: string;
};

export type TWLTooltipProps = {
  active?: boolean;
  label?: string;
  wlData?: TWLScaledPoint[];
};

export type TWalterLiethChartProps = {
  chartData: TMonthlyTemperatureWithAvg[];
  scales: TWalterLiethScales | null;
  summary: TChartSummary | null;
  colors?: TWalterLiethColors;
  title?: string;
  altitude?: number;
};

export type TWLCitiesLayoutProps = {
  chartDataA: TMonthlyTemperatureWithAvg[];
  chartDataB: TMonthlyTemperatureWithAvg[];
  labelA: string;
  labelB: string;
  scales: TWalterLiethScales | null;
  summaryA: TChartSummary | null;
  summaryB: TChartSummary | null;
};

export type TWLPeriodsLayoutProps = {
  chartDataA: TMonthlyTemperatureWithAvg[];
  chartDataB: TMonthlyTemperatureWithAvg[];
  scales: TWalterLiethScales | null;
  labelA: string;
  labelB: string;
  summaryA: TChartSummary | null;
  summaryB: TChartSummary | null;
};

export type TWLPeriodsTooltipProps = {
  active?: boolean;
  label?: string;
  wlDataA: TWLScaledPoint[];
  wlDataB: TWLScaledPoint[];
  labelA: string;
  labelB: string;
};

export type TStandardClimateChartProps = {
  chartData: Record<string, unknown>[];
  aridity: TMonthAridity[] | null;
  aridityA: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  rightMax: number;
  summary: TChartSummary | null;
  visible: TVisibleSeries;
  selectedMonths?: number[];
  isCompare: boolean;
  labelA?: string;
  labelB?: string;
  altitude?: number;
  showAridity?: boolean;
  multiPeriodData?: TMultiPeriodEntry[] | undefined;
  hiddenPeriods?: number[] | undefined;
  periodColors?: readonly string[] | undefined;
};
