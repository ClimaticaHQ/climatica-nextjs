import type {
  TChartMode,
  TChartSubtitle,
  TCompareMode,
  TMonthlyTemperature,
  TMultiPeriodEntry,
  TVariable,
  TVisibleSeries,
} from "@/types";
import type { ReactNode } from "react";

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
  onVisibleSeriesChange?: (visible: TVisibleSeries) => void;
  onChartModeChange?: (mode: TChartMode) => void;
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
