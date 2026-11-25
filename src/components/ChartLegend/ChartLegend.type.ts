import type { ELegendSwatch } from "@/enums";
import type { TLegendItem, TSeriesHatch, TSeriesShape, TLegendSwatch, TSwatchSize } from "@/types";

export type TChartLegendProps = {
  items: readonly TLegendItem[];
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

export type TEntitySwatchProps = TSwatchShapeProps & {
  shape: TSeriesShape;
  hatch: TSeriesHatch;
  fill: string;
};

export type TLineSwatchProps = TSwatchShapeProps & {
  dash?: string | undefined;
};

export type TFillSwatchProps = TSwatchShapeProps & {
  width?: number;
};

export type TMarkerSwatchProps = TSwatchShapeProps & {
  shape: TSeriesShape;
};

export type TFrostSwatchProps = TSwatchShapeProps & {
  outline: string;
};

export type THatchSwatchProps = TSwatchShapeProps & {
  regime: ELegendSwatch.HUMID | ELegendSwatch.ARID;
};
