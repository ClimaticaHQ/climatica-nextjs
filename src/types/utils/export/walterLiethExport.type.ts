import type { ECompareLayout, EWalterLiethSeriesId, EWalterLiethShading } from "@/enums";
import type {
  TWalterLiethDomain,
  TWalterLiethLayerPaint,
  TWalterLiethMonth,
  TWalterLiethSeriesInput,
} from "../walterLieth.type";
import type { TChartMode, TStatDeltas } from "../../components/chart";
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
};

/** The two-series block of a compare export — WL panels, or standard split panels. */
export type TComparisonExport = {
  chartMode: TChartMode;
  layout: ECompareLayout;
  shading: EWalterLiethShading;
  /** an incomplete series gets a notice instead of a panel and stays out of the domain */
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
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
    /** translated "incomplete data" notice per series */
    incomplete: Record<EWalterLiethSeriesId, string>;
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
