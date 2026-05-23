import type {
  TChartSummary,
  TMonthlyTemperatureWithAvg,
} from "@/components/TempPrecipChart/TempPrecipChart.type";
import type { TWalterLiethScales } from "@/types";

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

export type TSummaryStatsProps = {
  summary: TChartSummary;
  altitude?: number;
};
