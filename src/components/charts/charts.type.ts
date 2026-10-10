import type { EChartBlock, EChartBlockPlacement, EChartBody, EPairSide } from "@/enums";
import type {
  TActiveMonth,
  TChartFeatures,
  TChartMode,
  TChartModel,
  TChartPageResult,
  TChartSeriesModel,
  TChartViewState,
  TExpandedPanel,
  TLegendItem,
  TLegendLabels,
  TSeriesKindRule,
  TSeriesKey,
  TStatsTable,
  TVisibleSeries,
  TWalterLiethScales,
} from "@/types";
import type { TStandardChartColors } from "@/components/TempPrecipChart/charts/StandardClimateChart/StandardClimateChart.type";
import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import type { ComponentType, ReactNode, RefObject } from "react";

export type TChartCardProps = {
  /** derived once by the page (useChartModel) — the export draws from the same */
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  /** the variables the chips show — the export follows them */
  onVisibleChange?: ((visible: TVisibleSeries) => void) | undefined;
};

/** What the chart section draws from: the page hook's chart part. */
export type TChartSectionInput = Pick<
  TChartPageResult<unknown, unknown>,
  "state" | "model" | "viewState" | "features" | "exportMenu" | "onVisibleChange"
>;

export type TChartSectionProps = {
  chart: TChartSectionInput;
  /** the comparison pages scroll a picked city's chart into view here */
  scrollRef?: RefObject<HTMLDivElement | null> | undefined;
};

/** The active month shared by every chart and table of the card, with its setter. */
export type TCardActiveMonth = TActiveMonth & {
  onActiveMonthIndexChange: (index: number | null) => void;
};

/** What every body draws from. */
export type TChartBodyProps = {
  model: TChartModel;
  rule: TSeriesKindRule;
  body: EChartBody;
  viewState: TChartViewState;
  features: TChartFeatures;
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
  activeMonth: TCardActiveMonth;
  /** Recharts syncId: the card's charts hover in sync */
  syncId: string;
};

/** What a chart block is told about the chart it sits under. */
export type TChartBlockContext = {
  mode: TChartMode;
  body: EChartBody;
  rule: TSeriesKindRule;
  /** the series drawn where the block sits: one panel's, or every drawn one */
  entries: readonly TChartSeriesModel[];
  visible: TVisibleSeries;
  activeMonth: TActiveMonth;
  /** under a split panel: the compact sizes */
  isCompact: boolean;
  /** Walter-Lieth overlay: the hatched series' id; null: none */
  shadedId: string | null;
  /** split: the panel shown alone; null: both */
  shownPanel: TExpandedPanel;
};

export type TChartBlockProps = {
  context: TChartBlockContext;
};

/** What a block above the card is given: the whole model and the page's features. */
export type TSectionBlockProps = {
  model: TChartModel;
  features: TChartFeatures;
};

export type TChartBlockDefinition =
  | {
      placement: EChartBlockPlacement.PANEL | EChartBlockPlacement.BODY;
      Component: ComponentType<TChartBlockProps>;
    }
  | { placement: EChartBlockPlacement.SECTION; Component: ComponentType<TSectionBlockProps> };

export type TChartBlocksProps = {
  context: TChartBlockContext;
  /** the placements this spot renders: a panel's, the body's, or both (one panel) */
  placements: readonly EChartBlockPlacement[];
  hiddenBlocks: readonly EChartBlock[];
};

export type TChartCardHeaderProps = {
  model: TChartModel;
  rule: TSeriesKindRule;
  viewState: TChartViewState;
  features: TChartFeatures;
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
};

export type TSeriesChipsProps = {
  entries: readonly TChartSeriesModel[];
  rule: TSeriesKindRule;
  shown: readonly string[];
  onShownChange: (shown: readonly string[]) => void;
  onHighlight: (id: string | null) => void;
};

export type TSidePickerProps = {
  side: EPairSide;
  entries: readonly TChartSeriesModel[];
  rule: TSeriesKindRule;
  value: string;
  /** the other panel's series — not offered here */
  otherId: string;
  onChange: (id: string) => void;
};

export type TResolveChartBodyArgs = {
  viewState: TChartViewState;
  model: TChartModel;
  rule: TSeriesKindRule;
};

/** One body's legend items, from the block's context. */
export type TLegendBuilder = (
  context: TChartBlockContext,
  labels: TLegendLabels,
  walterLieth: TLegendItem[],
) => TLegendItem[];

/** What differs between the spots of one body. */
export type TBlockContextPart = Pick<TChartBlockContext, "entries" | "isCompact" | "shownPanel">;

export type TOverlayChartProps = TChartBodyProps & {
  /** the series drawn: every one, or those the chips leave on */
  drawn: readonly TChartSeriesModel[];
  /** a chip hovered or focused: the other series dim */
  highlightedId: string | null;
  footer: ReactNode;
};

/** One series in the standard chart. */
export type TStandardChartEntry = {
  id: string;
  label: string;
  palette: TStandardChartColors;
  /** 1, or less while another series is highlighted */
  emphasis: number;
  /** turned off by its chip: kept mounted (its place) but not drawn */
  isHidden: boolean;
};

export type TStandardChartProps = {
  entries: readonly TStandardChartEntry[];
  /** one row per month, each series' values under seriesDataKey */
  rows: readonly Record<string, unknown>[];
  hasMeanLine: boolean;
  scales: TWalterLiethScales | null;
  rightMax: number;
  visible: TVisibleSeries;
  selectedMonths?: number[] | undefined;
  activeMonth: TActiveMonth;
  footer: ReactNode;
};

export type TStandardChartLine = {
  variable: Exclude<TSeriesKey, "prec">;
  labelKey: string;
  /** none: a solid line */
  dash?: string;
};

/** A stats table column's look: its values' colour and its header's marker. */
export type TStatsTableColumn = {
  color: string;
  marker: TSeriesMarkerProps;
};

export type TStatsTableProps = {
  table: TStatsTable;
  columns: readonly TStatsTableColumn[];
  /** the Martonne row's name: per year, for one year, or plain */
  martonneLabel: string;
};
