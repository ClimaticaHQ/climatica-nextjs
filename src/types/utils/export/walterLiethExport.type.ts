import type { TSeriesShape } from "../../charts/seriesShape.type";
import type { TWalterLiethLegendLabels } from "../../components/legend";
import type {
  ECompareLayout,
  EWalterLiethFrost,
  EWalterLiethSeriesId,
  EWalterLiethShading,
} from "@/enums";
import type {
  TWalterLiethDomain,
  TWalterLiethLayerPaint,
  TWalterLiethMonth,
  TWalterLiethSeries,
  TWalterLiethSeriesInput,
} from "../walterLieth.type";
import type { TChartMode, TExpandedPanel, TVisibleSeries } from "../../components/chart";
import type { TComparisonTable, TComparisonTableLabels } from "../../components/comparisonTable";
import type { TMonthlyValuesRow } from "../../components/monthlyValues";
import type { TExportChartColors } from "./shared.type";

/** Pattern ids of one WL layer inside an exported SVG — unique per layer. */
export type TWalterLiethExportPatternIds = {
  humid: string;
  arid: string;
};

/** Pixel box of one plot area. */
export type TWalterLiethExportBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/** One series drawn into a panel — the export twin of TWalterLiethLayerSeries. */
export type TWalterLiethExportLayer = {
  months: readonly TWalterLiethMonth[];
  patternIds: TWalterLiethExportPatternIds;
  paint: TWalterLiethLayerPaint;
  /** hatching on/off — overlay hatches only the chosen series */
  isShaded: boolean;
  dotShape: TSeriesShape;
  /** dash pattern for the precipitation curve; solid when omitted */
  precDash?: string;
};

export type TWalterLiethExportPanelArgs = {
  layers: readonly TWalterLiethExportLayer[];
  domain: TWalterLiethDomain;
  colors: TExportChartColors;
  box: TWalterLiethExportBox;
  clipId: string;
  /** month labels under the plot; omitted when the caller draws its own */
  monthLabels?: readonly string[];
  /** the frost band's months (calendar order); null / omitted = no band (its room stays) */
  frost?: readonly EWalterLiethFrost[] | null | undefined;
};

/** The two-series block of a compare export — WL panels, or standard split panels. */
export type TComparisonExport = {
  chartMode: TChartMode;
  layout: ECompareLayout;
  shading: EWalterLiethShading;
  /** an incomplete series gets a notice instead of a panel and stays out of the domain */
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
  /** split: the one panel shown across the export, as on screen; null = both */
  expanded: TExpandedPanel;
  /** the stats table on top — the page's, complete even when a panel is expanded */
  table: TComparisonTable;
  /** the standard chart's chips: its strips' rows */
  visible: TVisibleSeries;
  /** short, locale-aware month labels */
  monthLabels: readonly string[];
  labels: {
    /** the UI's locale — the export's numbers read as on screen */
    locale: string;
    table: TComparisonTableLabels;
    temp: string;
    prec: string;
    humid: string;
    arid: string;
    perhumid: string;
    frost: string;
    /** translated "incomplete data" notice per series */
    incomplete: Record<EWalterLiethSeriesId, string>;
  };
};

/** Compare Periods with weather years in WL mode: one diagram per year, as on screen. */
export type TWalterLiethYearsExport = {
  /** one per compared year, in the page's order — the same series the screen draws */
  series: readonly TWalterLiethSeriesInput[];
  /** short, locale-aware month labels */
  monthLabels: readonly string[];
  labels: TWalterLiethLegendLabels & {
    /** the UI's locale — the export's numbers read as on screen */
    locale: string;
    /** translated "incomplete data" notice per year, by series label */
    incomplete: Readonly<Record<string, string>>;
  };
};

/**
 * Compare Periods with weather years, either chart type: the per-year series and what the screen
 * draws — the side-by-side pair, or the overlay's shown years.
 */
export type TWeatherYearsExport = TWalterLiethYearsExport & {
  chartMode: TChartMode;
  layout: ECompareLayout;
  /** the years drawn: the pair (A, B) side by side, the shown years overlaid */
  drawn: readonly number[];
};

/** One series of a WL overlay export: Climate A / B, or a weather year. */
export type TWalterLiethOverlayExportEntry = {
  key: string;
  series: TWalterLiethSeries;
  shape: TSeriesShape;
  isShaded: boolean;
};

export type TWalterLiethOverlayExportArgs = {
  entries: readonly TWalterLiethOverlayExportEntry[];
  domain: TWalterLiethDomain;
  colors: TExportChartColors;
  top: number;
  monthLabels: readonly string[];
  labels: TWalterLiethLegendLabels & { locale: string };
};

export type TPanelGridArgs = Omit<TComparisonPanelsArgs, "comparison"> & {
  series: readonly TWalterLiethSeriesInput[];
};

export type TCompareWalterLiethBody = {
  body: string;
  /** y where the body ends — the footer starts below it */
  bottom: number;
};

export type TExportPosition = {
  x: number;
  y: number;
};

export type TExportNoticeArgs = {
  text: string;
  box: TWalterLiethExportBox;
  colors: TExportChartColors;
};

export type TSplitPanelContext = {
  colors: TExportChartColors;
  left: number;
  top: number;
  panelWidth: number;
  panelHeight: number;
};

/** One panel's content: the chart type's plot in a box, and that plot's monthly values rows. */
export type TPanelContent = {
  renderPlot: (box: TWalterLiethExportBox) => string;
  valuesRows: readonly TMonthlyValuesRow[];
};

export type TSplitPanelArgs = TPanelContent & {
  series: TWalterLiethSeriesInput;
  context: TSplitPanelContext;
};

/** A plot and its monthly values table below it, in the plot's gutters. */
export type TPlotWithValuesArgs = TPanelContent & {
  box: TWalterLiethExportBox;
  /** the y axes' room either side of the plot */
  gutter: number;
  colors: TExportChartColors;
};

/** An export legend's markup and the y where its last row ends (legends wrap). */
export type TExportLegendResult = {
  svg: string;
  bottom: number;
};

/** One series' plot drawn into a box — the chart type's part of a comparison panel. */
export type TPanelPlotRenderer = (
  series: TWalterLiethSeriesInput,
) => (box: TWalterLiethExportBox) => string;

/** The comparison panels of an export: both side by side, or the expanded one alone. */
export type TComparisonPanelsArgs = {
  comparison: TComparisonExport;
  colors: TExportChartColors;
  top: number;
  renderPlot: TPanelPlotRenderer;
  /** each panel's monthly values rows (none for a WL panel that shows its notice) */
  valuesRows: (series: TWalterLiethSeriesInput) => readonly TMonthlyValuesRow[];
};

export type TExpandedPanelArgs = TPanelContent & {
  series: TWalterLiethSeriesInput;
  colors: TExportChartColors;
  top: number;
};

/** Where the export's frost band goes: under the x axis, month positions through scaleX. */
export type TExportFrostBandArgs = {
  colors: TExportChartColors;
  scaleX: (x: number) => number;
  /** px of the x axis */
  axisY: number;
};
