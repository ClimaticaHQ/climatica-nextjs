import type { EChartBlock, EChartBlockPlacement, EChartBody, EPairSide } from "@/enums";
import type {
  TActiveMonth,
  TChartFeatures,
  TChartMode,
  TChartModel,
  TChartSeriesModel,
  TChartViewState,
  TDataState,
  TExpandedPanel,
  TLegendItem,
  TLegendLabels,
  TPair,
  TSeriesKindRule,
  TVisibleSeries,
} from "@/types";
import type { ComponentType, ReactNode } from "react";

export type TChartCardProps = {
  /** derived once by the page (useChartModel) — the export draws from the same */
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  /** the variables the chips show — the export follows them */
  onVisibleChange?: ((visible: TVisibleSeries) => void) | undefined;
};

export type TChartSectionProps = {
  state: TDataState;
  /** the export menu, right-aligned above the section */
  toolbar: ReactNode;
  /** between the toolbar and the card: the stats table */
  summary?: ReactNode;
  /** while loading: a table's skeleton in the summary's place */
  hasSummary: boolean;
  /** the chart card */
  children: ReactNode;
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

export type TChartBlockDefinition = {
  placement: EChartBlockPlacement;
  Component: ComponentType<TChartBlockProps>;
};

export type TChartBlocksProps = {
  context: TChartBlockContext;
  /** the placements this spot renders: a panel's, the body's, or both (one panel) */
  placements: readonly EChartBlockPlacement[];
  hiddenBlocks: readonly EChartBlock[];
};

export type TChartCardHeaderProps = {
  names: readonly string[];
  subtitle: string | null;
  mode: TChartMode;
  selectedMonths: number[] | null;
  hasMonthBadge: boolean;
  viewState: TChartViewState;
};

export type TChartControlsProps = {
  model: TChartModel;
  rule: TSeriesKindRule;
  body: EChartBody;
  viewState: TChartViewState;
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

/** The two series a split shows, panel A's first. */
export type TSplitPair = {
  ids: TPair<string>;
  entries: readonly [TChartSeriesModel, TChartSeriesModel];
};

export type TOverlayChartProps = TChartBodyProps & {
  /** the series drawn: every one, or those the chips leave on */
  drawn: readonly TChartSeriesModel[];
  /** a chip hovered or focused: the other series dim */
  highlightedId: string | null;
  footer: ReactNode;
};
