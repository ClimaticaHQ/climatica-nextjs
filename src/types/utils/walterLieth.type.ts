import type { TChartSummary } from "../components/chart";
import type { TAnnotationBands, TChartOverlay } from "../charts/chartOverlay.type";
import type { ReactNode } from "react";
import type { EWalterLiethFrost, EWalterLiethRegime, EWalterLiethSeriesId } from "@/enums";
import type { TPanelHeaderSlots } from "../components/chart";
import type { TSeriesShape } from "../charts/seriesShape.type";

export type TMonthAridity = {
  month: number;
  isArid: boolean | null;
  prec: number | null;
  tavg: number | null;
  tmax: number | null;
  tmin: number | null;
};

export type TWalterLiethScales = {
  tempMin: number;
  tempMax: number;
  precMin: number;
  precMax: number;
  plotMax: number;
};

/** every comparison diagram shares one domain; precMin is derived (tempMin × LINEAR_RATIO), not stored */
export type TWalterLiethDomain = Omit<TWalterLiethScales, "precMin">;
// * every field is in the °C axis unit: precMax is after toPrecipAxisValue, never raw mm

export type TWalterLiethMonth = {
  tavg: number;
  prec: number;
  tmin?: number | null | undefined;
};

export type TWalterLiethSeries = {
  id: EWalterLiethSeriesId;
  label: string;
  period: string;
  altitude?: number;
  months: readonly TWalterLiethMonth[];
  singleYear?: number;
  shape?: TSeriesShape;
};

export type TWalterLiethPoint = {
  x: number;
  y: number;
};

export type TWalterLiethSegment = {
  regime: EWalterLiethRegime;
  points: readonly TWalterLiethPoint[];
};

export type TGetAridHumidSegmentsArgs = {
  months: readonly TWalterLiethMonth[];
  monthOrder?: readonly number[];
};

export type TWalterLiethDomainExtents = {
  tempMin: number;
  tempMax: number;
  precMaxMm: number;
};

export type TWalterLiethBandBounds = {
  lower: number;
  upper: number;
};

export type TWalterLiethFrameProps = Pick<
  TWalterLiethChartProps,
  "isCompact" | "isPanel" | "headerSlots" | "footer"
> & {
  series: TWalterLiethSeriesInput;
  summary: TChartSummary | null;
  ariaLabel?: string | undefined;
  plot?: ReactNode;
};

export type TWalterLiethChartProps = {
  series: TWalterLiethSeriesInput;
  domain: TWalterLiethDomain;
  isCompact?: boolean;
  isPanel?: boolean;
  headerSlots?: TPanelHeaderSlots | undefined;
  footer: ReactNode;
  /** Recharts syncs by data index: every diagram sharing a syncId needs the same month order and 12 rows */
  syncId?: string;
  monthOrder?: readonly number[];
  activeMonthIndex?: number | null | undefined;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
  isStatic?: boolean;
  overlay?: TChartOverlay;
  annotationBands?: TAnnotationBands;
};

export type TWalterLiethDiagramProps = Omit<TWalterLiethChartProps, "series"> & {
  series: TWalterLiethSeries;
};

export type TWalterLiethRow = {
  position: number;
  monthIndex: number;
  tavg: number;
  prec: number;
  precAxis: number;
};

export type TWalterLiethFillArgs = {
  regime: EWalterLiethRegime;
  humidPatternUrl: string;
  aridPatternUrl: string;
  perhumidColor: string;
};

export type TToSvgPathArgs = {
  points: readonly TWalterLiethPoint[];
  scaleX: (x: number) => number;
  scaleY: (y: number) => number;
  isClosed?: boolean;
};

export type TFormatMonthLabelArgs = {
  locale: string;
  monthIndex: number;
  format: "short" | "narrow" | "long";
};

export type TWalterLiethSourceRow = {
  tavg: number | null;
  prec: number | null;
  tmin?: number | null | undefined;
};

export type TToWalterLiethSeriesArgs = Omit<TWalterLiethSeries, "months"> & {
  data: readonly TWalterLiethSourceRow[];
};

/** a series missing a month's temperature or precipitation is never drawn as Walter-Lieth (a protected convention) */
export type TWalterLiethIncompleteSeries = Pick<
  TWalterLiethSeries,
  "id" | "label" | "altitude" | "singleYear" | "shape"
> & {
  period?: string;
  months: null;
};

export type TWalterLiethSeriesInput = TWalterLiethSeries | TWalterLiethIncompleteSeries;

export type TWalterLiethLayerPaint = {
  temp: string;
  prec: string;
  humidHatch: string;
  aridHatch: string;
  perhumid: string;
  perhumidOpacity: number;
};

export type TWalterLiethFrostPalette = {
  frost: string;
  outline: string;
  unknown: string;
};

export type TWalterLiethFrostRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TWalterLiethFrostCell = TWalterLiethFrostRect & {
  key: number;
  fill: string;
};

export type TWalterLiethFrostBoundary = {
  key: number;
  x: number;
  y1: number;
  y2: number;
};

export type TWalterLiethFrostBand = {
  cells: TWalterLiethFrostCell[];
  boundaries: TWalterLiethFrostBoundary[];
  frame: TWalterLiethFrostRect;
};

export type TWalterLiethFrostBandArgs = {
  frost: readonly EWalterLiethFrost[];
  palette: TWalterLiethFrostPalette;
  scaleX: (x: number) => number;
  axisY: number;
  isCompact: boolean;
  monthOrder?: readonly number[];
};

export type TWalterLiethProjection = {
  scaleX: (x: number) => number;
  scaleY: (y: number) => number;
};

export type TWalterLiethHatchGeometry = {
  spacing: number;
  dotRadius: number;
  dotRowHeight: number;
};

export type TFormatMonthNameArgs = Pick<TFormatMonthLabelArgs, "locale" | "monthIndex">;
