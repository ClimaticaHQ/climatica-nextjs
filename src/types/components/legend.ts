import type { ELegendSwatch } from "@/enums";
import type { TExpandedPanel, TVisibleSeries } from "./chart";

export type TLegendMarkerShape = "circle" | "square";

/** A legend swatch as data — the screen and the export each render it their own way. */
export type TLegendSwatch =
  | { kind: ELegendSwatch.LINE; color: string; dash?: string | undefined }
  | { kind: ELegendSwatch.BAR | ELegendSwatch.PERHUMID; color: string }
  | { kind: ELegendSwatch.MARKER; color: string; shape: TLegendMarkerShape }
  | { kind: ELegendSwatch.HUMID | ELegendSwatch.ARID; color: string }
  | { kind: ELegendSwatch.PAIR; a: TLegendSwatch; b: TLegendSwatch };

export type TLegendItem = {
  key: string;
  label: string;
  swatch: TLegendSwatch;
  /** drawn faded, e.g. a hidden multi-period year */
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
};

export type TWalterLiethLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  palette: TWalterLiethLegendPalette;
};

export type TLegendSeries = {
  key: string;
  label: string;
  color: string;
  shape?: TLegendMarkerShape;
  isHidden?: boolean;
};

export type TWalterLiethOverlayLegendItemsArgs = {
  labels: TWalterLiethLegendLabels;
  series: readonly TLegendSeries[];
  /** the shaded series' color; null = no hatching shown */
  shadeColor: string | null;
  /** the frost band's color — shown with the shaded series' band; null without shading */
  frostColor: string | null;
  /** line-style entries are drawn in this neutral color */
  neutral: string;
};

export type TAridityPalette = {
  arid: string;
  humid: string;
};

export type TStandardLegendItemsArgs = {
  labels: TStandardLegendLabels;
  colors: TLegendSeriesColors;
  visible: TVisibleSeries;
  /** arid / humid bar colors when the bars are recolored by aridity; null = not shown */
  aridity: TAridityPalette | null;
};

export type TStandardSplitLegendItemsArgs = {
  labels: TVariableLegendLabels;
  colorsA: TLegendSeriesColors;
  colorsB: TLegendSeriesColors;
  visible: TVisibleSeries;
  /** one panel expanded: only its colors, one swatch per variable */
  shown?: TExpandedPanel | undefined;
};

/** Bars recolored by aridity: their colors and legend texts. */
export type TAridityLegend = {
  palette: TAridityPalette;
  labels: TAridityLegendLabels;
};

export type TSeriesLegendItemsArgs = {
  labels: TVariableLegendLabels;
  series: readonly TLegendSeries[];
  visible: TVisibleSeries;
  neutral: string;
  /** whether the chart draws a tavg line (multi-period doesn't) */
  hasTavg: boolean;
  aridity: TAridityLegend | null;
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
