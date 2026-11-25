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

export type TWalterLiethExportPatternIds = {
  humid: string;
  arid: string;
};

export type TWalterLiethExportBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type TWalterLiethExportLayer = {
  months: readonly TWalterLiethMonth[];
  patternIds: TWalterLiethExportPatternIds;
  paint: TWalterLiethLayerPaint;
  isShaded: boolean;
  dotShape: TSeriesShape;
  precDash?: string;
};

export type TWalterLiethExportPanelArgs = {
  layers: readonly TWalterLiethExportLayer[];
  domain: TWalterLiethDomain;
  colors: TExportChartColors;
  box: TWalterLiethExportBox;
  clipId: string;
  monthLabels?: readonly string[];
  frost?: readonly EWalterLiethFrost[] | null | undefined;
};

export type TComparisonExport = {
  chartMode: TChartMode;
  layout: ECompareLayout;
  shading: EWalterLiethShading;
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
  expanded: TExpandedPanel;
  table: TComparisonTable;
  visible: TVisibleSeries;
  monthLabels: readonly string[];
  labels: {
    locale: string;
    table: TComparisonTableLabels;
    temp: string;
    prec: string;
    humid: string;
    arid: string;
    perhumid: string;
    frost: string;
    incomplete: Record<EWalterLiethSeriesId, string>;
  };
};

export type TWalterLiethYearsExport = {
  series: readonly TWalterLiethSeriesInput[];
  monthLabels: readonly string[];
  labels: TWalterLiethLegendLabels & {
    locale: string;
    incomplete: Readonly<Record<string, string>>;
  };
};

export type TWeatherYearsExport = TWalterLiethYearsExport & {
  chartMode: TChartMode;
  layout: ECompareLayout;
  drawn: readonly number[];
};

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

export type TPanelContent = {
  renderPlot: (box: TWalterLiethExportBox) => string;
  valuesRows: readonly TMonthlyValuesRow[];
};

export type TSplitPanelArgs = TPanelContent & {
  series: TWalterLiethSeriesInput;
  context: TSplitPanelContext;
};

export type TPlotWithValuesArgs = TPanelContent & {
  box: TWalterLiethExportBox;
  gutter: number;
  colors: TExportChartColors;
};

export type TExportLegendResult = {
  svg: string;
  bottom: number;
};

export type TPanelPlotRenderer = (
  series: TWalterLiethSeriesInput,
) => (box: TWalterLiethExportBox) => string;

export type TComparisonPanelsArgs = {
  comparison: TComparisonExport;
  colors: TExportChartColors;
  top: number;
  renderPlot: TPanelPlotRenderer;
  valuesRows: (series: TWalterLiethSeriesInput) => readonly TMonthlyValuesRow[];
};

export type TExpandedPanelArgs = TPanelContent & {
  series: TWalterLiethSeriesInput;
  colors: TExportChartColors;
  top: number;
};

export type TExportFrostBandArgs = {
  colors: TExportChartColors;
  scaleX: (x: number) => number;
  axisY: number;
};
