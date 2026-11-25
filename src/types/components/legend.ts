import type { ELegendSwatch } from "@/enums";
import type { TSeriesHatch, TSeriesShape } from "../charts/seriesShape.type";
import type { TVisibleSeries } from "./chart";

export type TLegendSwatch =
  | { kind: ELegendSwatch.LINE; color: string; dash?: string | undefined }
  | { kind: ELegendSwatch.BAR | ELegendSwatch.PERHUMID; color: string }
  | { kind: ELegendSwatch.MARKER; color: string; shape: TSeriesShape }
  | {
      kind: ELegendSwatch.ENTITY;
      color: string;
      shape: TSeriesShape;
      hatch: TSeriesHatch;
      fill: string;
      hatchColor: string;
    }
  | { kind: ELegendSwatch.HUMID | ELegendSwatch.ARID; color: string }
  | { kind: ELegendSwatch.FROST; color: string; outline: string };

export type TLegendItem = {
  key: string;
  label: string;
  swatch: TLegendSwatch;
  isMuted?: boolean;
};

export type TLegendLabels = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
  temp: string;
  humid: string;
  arid: string;
  perhumid: string;
  frost: string;
};

export type TVariableLegendLabels = Pick<TLegendLabels, "tmax" | "tmin" | "tavg" | "prec">;
export type TAridityLegendLabels = Pick<TLegendLabels, "arid" | "humid">;
export type TStandardLegendLabels = TVariableLegendLabels & TAridityLegendLabels;
export type TWalterLiethLegendLabels = Pick<
  TLegendLabels,
  "temp" | "prec" | "humid" | "arid" | "perhumid" | "frost"
>;

export type TLegendSeriesColors = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
};

export type TWalterLiethLegendPalette = {
  temp: string;
  prec: string;
  humidHatch: string;
  aridHatch: string;
  perhumid: string;
  frost: string;
  frostOutline: string;
};

export type TLegendFrostColors = {
  fill: string;
  outline: string;
};

export type TWalterLiethLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  palette: TWalterLiethLegendPalette;
};

export type TLegendSeries = {
  key: string;
  label: string;
  shape: TSeriesShape;
  hatch?: TSeriesHatch;
  fill?: string;
  isHidden?: boolean;
};

export type TWalterLiethOverlayLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  series: readonly TLegendSeries[];
  palette: TWalterLiethLegendPalette;
  isShaded: boolean;
  markerColor: string;
};

export type TAridityPalette = {
  arid: string;
  humid: string;
};

export type TStandardLegendItemsArgs = {
  labels: TStandardLegendLabels;
  colors: TLegendSeriesColors;
  visible: TVisibleSeries;
  aridity: TAridityPalette;
};

export type TSeriesLegendItemsArgs = {
  labels: TStandardLegendLabels;
  series: readonly TLegendSeries[];
  visible: TVisibleSeries;
  colors: TLegendSeriesColors;
  aridity: TAridityPalette;
  markerColor: string;
  hatchColor: string;
  hasTavg: boolean;
};

export type TSwatchSize = {
  width: number;
  height: number;
};

export type TLineDash = {
  tavg?: string;
  tmin?: string;
};
