import type { EAnnotationBand, EChartValueAxis, EFigureAnchor, EStatsBarItem } from "@/enums";
import type { TChartProjection } from "../charts/chartOverlay.type";

export type TFigureAnchor =
  | { kind: EFigureAnchor.POINT; month: number; axis: EChartValueAxis; value: number }
  | { kind: EFigureAnchor.SPAN; months: readonly number[]; band: EAnnotationBand }
  | { kind: EFigureAnchor.STATS_ITEM; item: EStatsBarItem };

export type TFigureAnnotation = {
  key: string;
  anchor: TFigureAnchor;
  captionKey: string;
};

export type TFigureMonthReading = { month: number; tavg: number; prec: number; tmin: number };

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

export type TAnnotationNumber = { number: number; x: number; y: number };

export type TTopAnnotationNumber = {
  number: number;
  wanted: number;
  point?: { x: number; y: number };
};

export type TAnnotationBracket = {
  number: number;
  months: readonly number[];
  x1: number;
  x2: number;
  y: number;
  tickDirection: 1 | -1;
};

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
  wanted: readonly number[];
  min: number;
  max: number;
  gap: number;
};

export type TFigurePlace = {
  NAME: string;
  PERIOD: string;
  GRID_KEY: string;
};
