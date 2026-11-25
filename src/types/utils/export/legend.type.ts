import type { TLegendItem, TLegendSwatch, TSwatchSize } from "../../components/legend";

export type TExportLegendArgs = {
  items: readonly TLegendItem[];
  y: number;
  left: number;
  width: number;
  textColor: string;
  idPrefix: string;
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

export type TExportSwatch = {
  svg: string;
  defs: string;
};
