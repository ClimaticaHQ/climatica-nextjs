import type {
  TAnnotationBands,
  TChartOverlay,
  TMonthLabelFormat,
  TWalterLiethHatchGeometry,
  TWalterLiethProjection,
  TWalterLiethDomain,
  TWalterLiethLayerPaint,
  TWalterLiethRow,
  TWalterLiethSegment,
  TWalterLiethSeries,
  TSeriesShape,
} from "@/types";
import type { EWalterLiethFrost } from "@/enums";
import type { ReactElement } from "react";

export type TUseWalterLiethChartArgs = {
  series: TWalterLiethSeries;
  monthOrder: readonly number[];
};

export type TUseWalterLiethAxesArgs = {
  rows: readonly TWalterLiethRow[];
  domain: TWalterLiethDomain;
  monthFormat: TMonthLabelFormat;
};

export type TWalterLiethPatternIds = {
  humid: string;
  arid: string;
};

export type TWalterLiethLayerSeries = {
  key: string;
  rows: readonly TWalterLiethRow[];
  segments: readonly TWalterLiethSegment[];
  patternIds: TWalterLiethPatternIds;
  colors: TWalterLiethLayerPaint;
  precDash?: string;
  dotShape: TSeriesShape;
  opacity?: number;
};

export type TWalterLiethLayerProps = {
  layers: readonly TWalterLiethLayerSeries[];
  xDomain: readonly [number, number];
  tempCeiling: number | null;
  hasSmallDots: boolean;
  activeMonthIndex?: number | null | undefined;
};

export type TWalterLiethHoverBandProps = {
  activeMonthIndex?: number | null | undefined;
  yMin: number;
  yMax: number;
};

export type TWalterLiethFrostBandProps = {
  frost: readonly EWalterLiethFrost[];
  axisValue: number;
  isCompact: boolean;
};

export type TWalterLiethCurveProps = {
  d: string;
  color: string;
  width: number;
  dash?: string | undefined;
};

export type TWalterLiethHaloProps = Pick<TWalterLiethCurveProps, "d" | "width">;

export type TWalterLiethSegmentPathsProps = TWalterLiethProjection & {
  segments: readonly TWalterLiethSegment[];
  patternIds: TWalterLiethPatternIds;
  colors: TWalterLiethLayerPaint;
};

export type TWalterLiethSeriesLayerProps = TWalterLiethProjection & {
  layer: TWalterLiethLayerSeries;
  hatchGeometry: TWalterLiethHatchGeometry;
  originX: number;
  hasSmallDots: boolean;
  activeMonthIndex?: number | null | undefined;
};

export type TWalterLiethDotProps = {
  x: number;
  y: number;
  shape: TSeriesShape;
  color: string;
  isActive: boolean;
  isDimmed: boolean;
  isSmall: boolean;
};

export type TWalterLiethPlotProps = {
  rows: readonly TWalterLiethRow[];
  domain: TWalterLiethDomain;
  layers: readonly TWalterLiethLayerSeries[];
  tooltip: ReactElement;
  isCompact: boolean;
  isStatic?: boolean;
  overlay?: TChartOverlay | undefined;
  annotationBands?: TAnnotationBands | undefined;
  frost?: readonly EWalterLiethFrost[] | null | undefined;
  syncId?: string | undefined;
  activeMonthIndex?: number | null | undefined;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
};

export type TWalterLiethTooltipProps = {
  active?: boolean;
  payload?: readonly { payload?: TWalterLiethRow }[];
};

export type TWalterLiethIncompleteNoticeProps = {
  label: string;
};

export type TUseWalterLiethChartsArgs = {
  series: readonly TWalterLiethSeries[];
  monthOrder: readonly number[];
};
