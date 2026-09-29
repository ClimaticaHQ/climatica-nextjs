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
  TWalterLiethSeriesInput,
} from "../walterLieth.type";
import type { TChartMode, TExpandedPanel, TStatDeltas } from "../../components/chart";
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
  dotShape: "circle" | "square";
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
  /** B's difference from A under B's split-panel stats; only when both series are complete */
  deltas?: TStatDeltas | undefined;
  /** short, locale-aware month labels */
  monthLabels: readonly string[];
  labels: {
    meanTemp: string;
    annualPrec: string;
    aridMonths: string;
    /** short stats-cell label, "Martonne (M)" */
    martonne: string;
    /** translated Martonne class per series; null when unknown */
    martonneClasses: Record<EWalterLiethSeriesId, string | null>;
    temp: string;
    prec: string;
    humid: string;
    arid: string;
    perhumid: string;
    frost: string;
    /** translated "incomplete data" notice per series */
    incomplete: Record<EWalterLiethSeriesId, string>;
    /** B's note when shown without A: "differences vs {A}" */
    differencesVs: string;
  };
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

/** A Martonne class badge in the export: translated text on its class colors. */
export type TExportBadge = {
  text: string;
  bg: string;
  color: string;
};

/** One stats cell of a split export panel: label / value / meta, like the screen's cards. */
export type TExportStatCell = {
  label: string;
  value: string;
  badge?: TExportBadge | undefined;
  meta?: string | undefined;
};

export type TSplitPanelContext = {
  colors: TExportChartColors;
  left: number;
  top: number;
  panelWidth: number;
  /** shared by both panels, so their plots start at the same y */
  headerHeight: number;
  panelHeight: number;
};

export type TSplitPanelArgs = {
  series: TWalterLiethSeriesInput;
  comparison: TComparisonExport;
  context: TSplitPanelContext;
  /** the chart type's plot, drawn in the box under the header */
  renderPlot: (box: TWalterLiethExportBox) => string;
};

export type TExportStatCellsArgs = {
  cells: readonly TExportStatCell[];
  colors: TExportChartColors;
  x: number;
  y: number;
  width: number;
  /** the frame's height — taller when a delta drops to a second meta line */
  height: number;
};

/** A stats cell's meta row: its text origin and the cell's width (for wrapping the delta). */
export type TExportMetaPosition = TExportPosition & {
  cellWidth: number;
};

/** Where a split panel's header goes: its inner top-left, width and stats-frame height. */
export type TExportPanelHeaderBox = TExportPosition & {
  width: number;
  statsHeight: number;
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
};

export type TExpandedPanelArgs = {
  series: TWalterLiethSeriesInput;
  comparison: TComparisonExport;
  colors: TExportChartColors;
  top: number;
  renderPlot: (box: TWalterLiethExportBox) => string;
};

/** The header height the given panels share at this inner (stats) width. */
export type TPanelHeaderHeightArgs = {
  panels: readonly TWalterLiethSeriesInput[];
  comparison: TComparisonExport;
  innerWidth: number;
};

/** Where the export's frost band goes: under the x axis, month positions through scaleX. */
export type TExportFrostBandArgs = {
  colors: TExportChartColors;
  scaleX: (x: number) => number;
  /** px of the x axis */
  axisY: number;
};
