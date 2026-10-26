import type { TLegendItem, TLegendSwatch, TSwatchSize } from "../../components/legend";

/** An export legend: the shared legend items, flowed into rows from `left`. */
export type TExportLegendArgs = {
  items: readonly TLegendItem[];
  /** baseline of the first row */
  y: number;
  left: number;
  width: number;
  textColor: string;
  /** prefix for this legend's pattern ids — unique within the SVG */
  idPrefix: string;
  /** a label's width in px at a font size; canvas measureText in the export font by default */
  measureText?: TTextMeasurer;
};

export type TTextMeasurer = (text: string, fontSize: number) => number;

export type TExportSwatchArgs = {
  swatch: TLegendSwatch;
  x: number;
  top: number;
  size: TSwatchSize;
  id: string;
};

/** A swatch's markup, plus any pattern defs it references. */
export type TExportSwatch = {
  svg: string;
  defs: string;
};
