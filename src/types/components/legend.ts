import type { ELegendSwatch } from "@/enums";
import type { TSeriesHatch, TSeriesShape } from "../charts/seriesShape.type";
import type { TVisibleSeries } from "./chart";

/** A legend swatch as data — the screen and the export each render it their own way. */
export type TLegendSwatch =
  | { kind: ELegendSwatch.LINE; color: string; dash?: string | undefined }
  | { kind: ELegendSwatch.BAR | ELegendSwatch.PERHUMID; color: string }
  | { kind: ELegendSwatch.MARKER; color: string; shape: TSeriesShape }
  | {
      kind: ELegendSwatch.ENTITY;
      /** the shape's graphite */
      color: string;
      shape: TSeriesShape;
      hatch: TSeriesHatch;
      /** the hatch's base: the humid fill */
      fill: string;
      /** the hatch itself: the card's surface */
      hatchColor: string;
    }
  | { kind: ELegendSwatch.HUMID | ELegendSwatch.ARID; color: string }
  | { kind: ELegendSwatch.FROST; color: string; outline: string };

export type TLegendItem = {
  key: string;
  label: string;
  swatch: TLegendSwatch;
  /** drawn faded, e.g. a series its chip turned off */
  isMuted?: boolean;
};

/** Translated legend texts — the screen and the export pass their own. */
export type TLegendLabels = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
  /** WL mean temperature curve */
  temp: string;
  humid: string;
  arid: string;
  perhumid: string;
  /** WL frost band: "Frost (mean min < 0 °C)" */
  frost: string;
};

export type TVariableLegendLabels = Pick<TLegendLabels, "tmax" | "tmin" | "tavg" | "prec">;
export type TAridityLegendLabels = Pick<TLegendLabels, "arid" | "humid">;
export type TStandardLegendLabels = TVariableLegendLabels & TAridityLegendLabels;
export type TWalterLiethLegendLabels = Pick<
  TLegendLabels,
  "temp" | "prec" | "humid" | "arid" | "perhumid" | "frost"
>;

/** Colors of one standard series: lines and bars. */
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

/** The frost cell's colors in a legend: its fill and its outline. */
export type TLegendFrostColors = {
  fill: string;
  outline: string;
};

export type TWalterLiethLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  palette: TWalterLiethLegendPalette;
};

/** A compared entity in a legend: named by its shape (never a colour). */
export type TLegendSeries = {
  key: string;
  label: string;
  shape: TSeriesShape;
  /** an overlay of bars: the entity's hatch too */
  hatch?: TSeriesHatch;
  isHidden?: boolean;
};

export type TWalterLiethOverlayLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  series: readonly TLegendSeries[];
  /** the diagram's semantic colours, as in a single diagram */
  palette: TWalterLiethLegendPalette;
  /** a series is hatched: the regimes and the frost band are shown */
  isShaded: boolean;
  /** the entities' shapes are drawn in this graphite */
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
  /** the bars' humid / arid fills: they stand for precipitation in the legend */
  aridity: TAridityPalette;
};

export type TSeriesLegendItemsArgs = {
  labels: TStandardLegendLabels;
  series: readonly TLegendSeries[];
  visible: TVisibleSeries;
  /** the variables' semantic colours, as in a single chart */
  colors: TLegendSeriesColors;
  /** the bars' humid / arid fills */
  aridity: TAridityPalette;
  /** the entities' shapes are drawn in this graphite */
  markerColor: string;
  /** their hatches are knocked out in this colour: the card's surface */
  hatchColor: string;
  /** whether the chart draws a mean temperature line */
  hasTavg: boolean;
};

/** Swatch box in px — derived from the legend's font size. */
export type TSwatchSize = {
  width: number;
  height: number;
};

/** Dash pattern per variable (tmax is always solid); an absent entry is drawn solid. */
export type TLineDash = {
  tavg?: string;
  tmin?: string;
};
