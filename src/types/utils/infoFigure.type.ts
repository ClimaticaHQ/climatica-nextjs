import type { EAnnotationBand, EChartValueAxis, EFigureAnchor, EStatsBarItem } from "@/enums";
import type { TChartProjection } from "../charts/chartOverlay.type";

/** An annotation's anchor in data space: projected through the chart's scales, never pixels. */
export type TFigureAnchor =
  | { kind: EFigureAnchor.POINT; month: number; axis: EChartValueAxis; value: number }
  | { kind: EFigureAnchor.SPAN; months: readonly number[]; band: EAnnotationBand }
  | { kind: EFigureAnchor.STATS_ITEM; item: EStatsBarItem };

/** One numbered annotation of a figure: what it marks and the message that explains it. */
export type TFigureAnnotation = {
  key: string;
  anchor: TFigureAnchor;
  captionKey: string;
};

/** A fixture month with every value, read for choosing annotated months. */
export type TFigureMonthReading = { month: number; tavg: number; prec: number; tmin: number };

/** The annotation band's geometry (px): its height, the number's size and the gaps. */
export type TAnnotationLayout = {
  topBand: number;
  bottomBand: number;
  numberRadius: number;
  numberFontSize: number;
  numberGap: number;
  bracketTick: number;
};

export type TScaleAnnotationLayoutArgs = {
  layout: TAnnotationLayout;
  /** the effective text scale (useTextScale) */
  textScale: number;
};

export type TAnnotationBandsArgs = {
  annotations: readonly TFigureAnnotation[];
  layout: TAnnotationLayout;
};

export type TLayoutAnnotationsArgs = {
  annotations: readonly TFigureAnnotation[];
  projection: TChartProjection;
  layout: TAnnotationLayout;
};

/** An annotation's number in a band, numbered by its place in the caption. */
export type TAnnotationNumber = { number: number; x: number; y: number };

/** A number bound for the top band: where it wants to be, and the point its leader ends on. */
export type TTopAnnotationNumber = {
  number: number;
  wanted: number;
  point?: { x: number; y: number };
};

/** A bracket segment over a run of months; the number sits on one of them. */
export type TAnnotationBracket = {
  number: number;
  months: readonly number[];
  x1: number;
  x2: number;
  y: number;
  /** +1: its end ticks point down (a top bracket), -1: up (a bottom bracket) */
  tickDirection: 1 | -1;
};

/** A point annotation's leader: from its number down to the anchored point, ringed there. */
export type TAnnotationLeader = {
  number: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type TAnnotationDrawing = {
  numbers: TAnnotationNumber[];
  brackets: TAnnotationBracket[];
  leaders: TAnnotationLeader[];
};

export type TSpreadArgs = {
  /** the numbers' wanted centres, in any order */
  wanted: readonly number[];
  min: number;
  max: number;
  /** the least distance between two centres */
  gap: number;
};
