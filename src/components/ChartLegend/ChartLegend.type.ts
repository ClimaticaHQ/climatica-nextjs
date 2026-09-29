import type { ELegendSwatch } from "@/enums";
import type { TLegendItem, TLegendMarkerShape, TLegendSwatch, TSwatchSize } from "@/types";

export type TChartLegendProps = {
  items: readonly TLegendItem[];
  /** px; swatches scale with it */
  fontSize?: number;
};

export type TLegendSwatchProps = {
  swatch: TLegendSwatch;
  size: TSwatchSize;
};

export type TSwatchShapeProps = {
  color: string;
  size: TSwatchSize;
};

export type TLineSwatchProps = TSwatchShapeProps & {
  dash?: string | undefined;
};

export type TFillSwatchProps = TSwatchShapeProps & {
  /** box width; the full swatch width when omitted (a bar is narrower) */
  width?: number;
};

export type TMarkerSwatchProps = TSwatchShapeProps & {
  shape: TLegendMarkerShape;
};

export type THatchSwatchProps = TSwatchShapeProps & {
  regime: ELegendSwatch.HUMID | ELegendSwatch.ARID;
};
