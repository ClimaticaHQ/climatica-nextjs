import type {
  TMonthLabelFormat,
  TWalterLiethHatchGeometry,
  TWalterLiethProjection,
  TWalterLiethDomain,
  TWalterLiethLayerPaint,
  TWalterLiethRow,
  TWalterLiethSegment,
  TWalterLiethSeries,
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

export type TWalterLiethDotShape = "circle" | "square";

/** One series drawn by WalterLiethLayer. */
export type TWalterLiethLayerSeries = {
  key: string;
  rows: readonly TWalterLiethRow[];
  /** empty = no hatching for this series */
  segments: readonly TWalterLiethSegment[];
  patternIds: TWalterLiethPatternIds;
  colors: TWalterLiethLayerPaint;
  /** dash pattern for the precipitation curve; solid when omitted */
  precDash?: string;
  /** second visual cue besides color, so overlay series never rely on color alone */
  dotShape: TWalterLiethDotShape;
};

export type TWalterLiethLayerProps = {
  layers: readonly TWalterLiethLayerSeries[];
  /** x-axis domain, for lines spanning the whole plot */
  xDomain: readonly [number, number];
  /** y (°C) of the dashed top-of-scale line; null when the plot isn't widened above tempMax */
  tempCeiling: number | null;
  /** smaller temperature markers on small screens */
  hasSmallDots: boolean;
  activeMonthIndex?: number | null | undefined;
};

export type TWalterLiethHoverBandProps = {
  activeMonthIndex?: number | null | undefined;
  /** the plot's °C domain — the band spans it top to bottom */
  yMin: number;
  yMax: number;
};

export type TWalterLiethFrostBandProps = {
  /** one state per calendar month */
  frost: readonly EWalterLiethFrost[];
  /** the °C value at the x axis (the domain's minimum) — the band hangs below it */
  axisValue: number;
  /** one panel of a split pair: the lower band */
  isCompact: boolean;
};

export type TWalterLiethCurveProps = {
  d: string;
  color: string;
  width: number;
  dash?: string | undefined;
};

/** The background-colored band under a curve; width = the curve's own stroke width. */
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
  shape: TWalterLiethDotShape;
  color: string;
  isActive: boolean;
  isDimmed: boolean;
  isSmall: boolean;
};

/** Recharts shell shared by the single diagram and the overlay: axes, tooltip, layers. */
export type TWalterLiethPlotProps = {
  /** rows that register the data with the axes — the first series' */
  rows: readonly TWalterLiethRow[];
  domain: TWalterLiethDomain;
  layers: readonly TWalterLiethLayerSeries[];
  tooltip: ReactElement;
  isCompact: boolean;
  /** the frost band's months (calendar order); null = no band drawn (its room stays) */
  frost?: readonly EWalterLiethFrost[] | null | undefined;
  syncId?: string | undefined;
  activeMonthIndex?: number | null | undefined;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
};

/** Props Recharts injects into custom tooltip content; each payload item carries its row. */
export type TWalterLiethTooltipProps = {
  active?: boolean;
  payload?: readonly { payload?: TWalterLiethRow }[];
};

export type TWalterLiethIncompleteNoticeProps = {
  label: string;
};
