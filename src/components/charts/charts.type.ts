import type {
  EChartBlock,
  EChartBlockPlacement,
  EChartBody,
  EPairSide,
  ECompareLayout,
  EWalterLiethShading,
} from "@/enums";
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
  TMonthLabelFormat,
  TVariable,
  TChartSummary,
  TMonthAridity,
  TMonthlyTemperatureWithAvg,
  TPanelHeaderSlots,
  TWalterLiethSeriesInput,
  TWalterLiethDomain,
  TWalterLiethRow,
  TWalterLiethSeries,
} from "@/types";
import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import type { ComponentType, ReactNode, RefObject } from "react";
import type {
  TWalterLiethDotShape,
  TWalterLiethLayerSeries,
  TWalterLiethTooltipProps,
} from "@/components/WalterLiethChart/WalterLiethChart.type";

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

export type TBarShape = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  /** passed by Recharts from the data entry */
  month?: number;
  /** passed via shape={<PrecipBarShape selectedMonths={...} />} */
  selectedMonths?: readonly number[] | undefined;
  /** month → isArid lookup, passed via shape prop to avoid Cell children */
  aridityByMonth?: Record<number, boolean> | undefined;
  /** 0-based chart index, matching recharts' activeTooltipIndex — passed via shape prop */
  activeMonthIndex?: number | null;
  yAxis?: { scale?: (v: number) => number };
};

/**
 * All fields typed as T | undefined because recharts DotItemDotProps uses string | undefined
 * for some fields, and exactOptionalPropertyTypes requires explicit undefined unions.
 */
export type TDotRendererProps = {
  cx?: number | undefined;
  cy?: number | undefined;
  r?: number | string | undefined;
  fill?: string | undefined;
  stroke?: string | undefined;
  index?: number | undefined;
};

export type TChartSwitchesProps = {
  /** the chart type selected */
  chartMode: TChartMode;
  /** compare pages only (either chart type) — omitted, no layout control is shown */
  layout?: ECompareLayout | undefined;
  onLayoutChange: (layout: ECompareLayout) => void;
};

export type TChartTitleProps = {
  /** one location, or the two compared ones — shown as "A vs B" */
  names: readonly string[];
  /** the chart type, as a small muted line above the title */
  subtitleText: string | null;
  eyebrow?: string | undefined;
  selectedMonths?: number[] | undefined;
  /** standard single-city chart only — WL and comparisons show every month */
  showMonthBadge: boolean;
};

export type TVariableChipsProps = {
  visible: TVisibleSeries;
  /** the fetched variables; undefined = all available */
  variables?: readonly TVariable[] | undefined;
  onChange: (visible: TVisibleSeries) => void;
  /** one line scrolling sideways, from the left — under the year chips */
  isScrollRow?: boolean;
};

export type TUseVisibleSeriesArgs = {
  /** the fetched variables; undefined = all available */
  variables?: readonly TVariable[] | undefined;
  onVisibleSeriesChange?: ((visible: TVisibleSeries) => void) | undefined;
};

export type TStandardChartAxesProps = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  /** a split panel's narrower axes and smaller ticks */
  isCompact: boolean;
  /** month label format for the chart's measured width (getMonthLabelFormat) */
  monthFormat: TMonthLabelFormat;
};

export type TChartTitleNamesProps = {
  names: readonly string[];
};

export type TMonthBadgeProps = {
  selectedMonths?: number[] | undefined;
};

/** Recharts' series animation, and how long a hidden series stays for it. */
export type TSeriesToggleMotion = {
  isAnimationActive: boolean;
  /** ms — the series leaves the tooltip / legend once its fade-out is done */
  toggleMs: number;
};

export type TStandardClimateChartProps = {
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
  scales: TWalterLiethScales | null;
  rightMax: number;
  summary: TChartSummary | null;
  visible: TVisibleSeries;
  selectedMonths?: number[];
  altitude?: number;
  /** the one weather year the stats describe — the Martonne cell names it */
  martonneYear?: number | undefined;
  showAridity?: boolean;
  activeMonthIndex?: number | null;
  onActiveMonthIndexChange?: (index: number | null) => void;
  /** line and bar colors; the single-city palette when omitted */
  colors?: TStandardChartColors;
  /** one panel of a split pair: compact, no own legend, WL-panel axes */
  isPanel?: boolean;
  /** Recharts syncId — split panels hover in sync */
  syncId?: string;
  /** the chart card's blocks (values table, legend), drawn under this chart */
  footer: ReactNode;
};

export type TStandardChartColors = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
};

/** One series of the split: its header (name, period, stats) and its own chart rows. */
export type TStandardSplitSeries = {
  series: TWalterLiethSeriesInput;
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
  colors: TStandardChartColors;
};

/** What both panels share: domains, visible variables, month filter, hover. */
export type TStandardSplitShared = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  visible: TVisibleSeries;
  selectedMonths?: number[] | undefined;
  activeMonthIndex: number | null;
  onActiveMonthIndexChange: (index: number | null) => void;
  syncId: string;
};

export type TStandardPanelProps = TStandardSplitShared & {
  panel: TStandardSplitSeries;
  headerSlots?: TPanelHeaderSlots | undefined;
  /** the chart card's panel blocks, drawn under the panel's chart */
  footer: ReactNode;
  /** the update keys this panel flashes for — its series' id when omitted */
  flashKeys?: readonly string[];
};

export type TSeriesPair = {
  seriesA: TWalterLiethSeries;
  seriesB: TWalterLiethSeries;
};

export type TShadingControlProps = TSeriesPair & {
  shading: EWalterLiethShading;
  onChange: (shading: EWalterLiethShading) => void;
};

/** One series in an overlay: Climate A / B, or a compared weather year. */
export type TOverlayEntry = {
  key: string;
  series: TWalterLiethSeries;
  color: string;
  shape: TWalterLiethDotShape;
  /** hatched (humid / arid) — at most one, so the curves stay readable */
  isShaded: boolean;
  /** another entry is highlighted: this one fades */
  isDimmed?: boolean;
};

export type TWalterLiethOverlayProps = {
  entries: readonly TOverlayEntry[];
  domain: TWalterLiethDomain;
  activeMonth: TActiveMonth;
  /** the chart card's blocks (values table, legend), drawn under this chart */
  footer: ReactNode;
};

export type TOverlayLayerArgs = Omit<
  TWalterLiethLayerSeries,
  "colors" | "precDash" | "dotShape"
> & {
  series: TWalterLiethSeries;
  isShaded: boolean;
  /** the series' own colour and dot; A / B's when omitted */
  color?: string;
  shape?: TWalterLiethDotShape;
};

/** What the overlay tooltip lists for each entry. */
export type TOverlayTooltipEntry = {
  key: string;
  label: string;
  color: string;
  rows: readonly TWalterLiethRow[];
};

export type TOverlayTooltipProps = TWalterLiethTooltipProps & {
  entries: readonly TOverlayTooltipEntry[];
};
