import type { TWalterLiethScales } from "@/types";

export type TMonthAtArgs = {
  x: number;
  width: number;
  inset: number;
  monthCount: number;
};

export type TChartDevice = {
  isTouch: boolean;
  isNarrow: boolean;
  textScale: number;
};

export type TStandardYAxesArgs = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  isNarrow: boolean;
};

export type TStandardTempAxisArgs = {
  scales: TWalterLiethScales;
  isNarrow: boolean;
};

export type TAxisTicksArgs = {
  min: number;
  max: number;
  count: number;
};

export type TRoundTicksArgs = {
  min: number;
  max: number;
  maxCount: number;
  steps: readonly number[];
};

export type TTemperatureAxisArgs = {
  min: number;
  max: number;
  maxCount: number;
};

export type TTouchTooltipArgs = {
  isTouch: boolean;
  activeMonthIndex: number | null | undefined;
  visibleLeft?: number | undefined;
};
