import type {
  EChartBlock,
  EChartBlockPlacement,
  EChartBody,
  EDifferenceMeaning,
  EPairSide,
  ECompareLayout,
  EStatsBarItem,
  EWalterLiethShading,
} from "@/enums";
import type {
  TActiveMonth,
  TAnnotationBands,
  TChartOverlay,
  TOverlayFocus,
  TChartFeatures,
  TSeriesSort,
  TChartMode,
  TChartModel,
  TChartPageResult,
  TChartSeriesModel,
  TEntityBarSwatch,
  TChartViewState,
  TExpandedPanel,
  TLegendItem,
  TLegendLabels,
  TLegendSwatch,
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
  TSeriesShape,
  TSeriesHatch,
  TAridityPalette,
  TBarStyle,
} from "@/types";
import type { TSeriesMarkerProps } from "@/components/SeriesMarker/SeriesMarker.type";
import type { ComponentType, ReactNode, RefObject } from "react";
import type {
  TWalterLiethLayerSeries,
  TWalterLiethTooltipProps,
} from "@/components/WalterLiethChart/WalterLiethChart.type";

export type TChartCardProps = {
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  onVisibleChange?: ((visible: TVisibleSeries) => void) | undefined;
};

export type TChartSectionInput = Pick<
  TChartPageResult<unknown, unknown>,
  "state" | "model" | "viewState" | "features" | "exportMenu" | "onVisibleChange"
>;

export type TChartSectionProps = {
  chart: TChartSectionInput;
  scrollRef?: RefObject<HTMLDivElement | null> | undefined;
};

export type TCardActiveMonth = TActiveMonth & {
  onActiveMonthIndexChange: (index: number | null) => void;
};

export type TChartBodyProps = {
  model: TChartModel;
  rule: TSeriesKindRule;
  body: EChartBody;
  viewState: TChartViewState;
  features: TChartFeatures;
  barStyle: TBarStyle;
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
  activeMonth: TCardActiveMonth;
  syncId: string;
  highlightedId: string | null;
};

export type TChartBlockContext = {
  mode: TChartMode;
  body: EChartBody;
  rule: TSeriesKindRule;
  entries: readonly TChartSeriesModel[];
  visible: TVisibleSeries;
  activeMonth: TActiveMonth;
  isCompact: boolean;
  shadedId: string | null;
  shownPanel: TExpandedPanel;
  barStyle: TBarStyle;
};

export type TChartBlockProps = {
  context: TChartBlockContext;
};

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
  placements: readonly EChartBlockPlacement[];
  hiddenBlocks: readonly EChartBlock[];
};

export type TChartCardHeaderProps = {
  model: TChartModel;
  rule: TSeriesKindRule;
  viewState: TChartViewState;
  features: TChartFeatures;
  body: EChartBody;
  barStyle: TBarStyle;
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
  onHighlight: (id: string | null) => void;
};

export type TChartToolbarProps = {
  chips?: ReactNode;
  controls: ReactNode;
  isStacked: boolean;
};

export type TSeriesChipsProps = {
  entries: readonly TChartSeriesModel[];
  barStyle?: TBarStyle | undefined;
  shown: readonly string[];
  onShownChange: (shown: readonly string[]) => void;
  onHighlight: (id: string | null) => void;
};

export type TSidePickerProps = {
  side: EPairSide;
  entries: readonly TChartSeriesModel[];
  value: string;
  otherId: string;
  onChange: (id: string) => void;
};

export type TResolveChartBodyArgs = {
  viewState: TChartViewState;
  model: TChartModel;
  rule: TSeriesKindRule;
  isLoading: boolean;
};

export type TLegendBuilder = (
  context: TChartBlockContext,
  labels: TLegendLabels,
  walterLieth: TLegendItem[],
) => TLegendItem[];

export type TBlockContextPart = Pick<TChartBlockContext, "entries" | "isCompact" | "shownPanel">;

export type TOverlayChartProps = TChartBodyProps & {
  drawn: readonly TChartSeriesModel[];
  highlightedId: string | null;
  footer: ReactNode;
};

export type TStandardChartEntry = {
  id: string;
  label: string;
  aridityByMonth: Record<number, boolean> | undefined;
  barFills?: TAridityPalette | undefined;
  hatch: TSeriesHatch;
  swatch?: TEntityBarSwatch | undefined;
  isHidden: boolean;
  marker: TSeriesMarkerProps;
};

export type TTooltipFocus = {
  text: string;
  marker: TSeriesMarkerProps;
};

export type TUseOverlayFocusArgs = {
  entries: readonly TStandardChartEntry[];
  rows: readonly Record<string, unknown>[];
  lines: readonly TStandardChartLine[];
  activeMonthIndex: number | null;
};

export type TStandardTooltipProps = {
  active?: boolean;
  payload?: readonly { name?: string | number; value?: unknown; color?: string }[];
  label?: string | number;
  formatLabel: (label: unknown) => string;
  markerOf?: (name: string) => TSeriesMarkerProps | undefined;
  swatchOf?: (name: string) => TLegendSwatch | undefined;
  focus?: TTooltipFocus | null;
};

export type TStandardChartProps = {
  entries: readonly TStandardChartEntry[];
  barStyle?: TBarStyle | undefined;
  rows: readonly Record<string, unknown>[];
  hasMeanLine: boolean;
  scales: TWalterLiethScales | null;
  rightMax: number;
  visible: TVisibleSeries;
  selectedMonths?: number[] | undefined;
  highlightedId: string | null;
  activeMonth: TActiveMonth;
  footer: ReactNode;
};

export type TStandardChartLine = {
  variable: Exclude<TSeriesKey, "prec">;
  labelKey: string;
  dash?: string;
};

export type TStatsTableColumn = {
  marker: TSeriesMarkerProps;
};

export type TStatsTableProps = {
  table: TStatsTable;
  columns: readonly TStatsTableColumn[];
  martonneLabel: string;
  differenceMeaning: EDifferenceMeaning | null;
  sort?: TSeriesSort | undefined;
};

export type TStatsTableHeadProps = Omit<TStatsTableProps, "martonneLabel">;

export type TSortButtonProps = {
  sort: TSeriesSort;
};

export type TSeriesHeadLabelProps = {
  label: string;
};

export type TBarShape = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
  fill?: string;
  month?: number;
  selectedMonths?: readonly number[] | undefined;
  aridityByMonth?: Record<number, boolean> | undefined;
  activeMonthIndex?: number | null;
  hatchFill?: string | undefined;
  fills?: TAridityPalette | undefined;
  yAxis?: { scale?: (v: number) => number };
};

/** T | undefined: Recharts' DotItemDotProps passes undefined, which exactOptionalPropertyTypes needs spelled out */
export type TDotRendererProps = {
  cx?: number | undefined;
  cy?: number | undefined;
  r?: number | string | undefined;
  fill?: string | undefined;
  stroke?: string | undefined;
  index?: number | undefined;
};

export type TChartSwitchesProps = {
  chartMode: TChartMode;
  layout?: ECompareLayout | undefined;
  onLayoutChange: (layout: ECompareLayout) => void;
};

export type TChartTitleProps = {
  names: readonly string[];
  subtitleText: string | null;
  eyebrow?: string | undefined;
  selectedMonths?: number[] | undefined;
  showMonthBadge: boolean;
};

export type TVariableChipsProps = {
  visible: TVisibleSeries;
  variables?: readonly TVariable[] | undefined;
  onChange: (visible: TVisibleSeries) => void;
};

export type TUseVisibleSeriesArgs = {
  variables?: readonly TVariable[] | undefined;
  onVisibleSeriesChange?: ((visible: TVisibleSeries) => void) | undefined;
};

export type TStandardChartAxesProps = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  isCompact: boolean;
  monthFormat: TMonthLabelFormat;
  shouldShowUnitTitles?: boolean;
};

export type TChartTitleNamesProps = {
  names: readonly string[];
};

export type TMonthBadgeProps = {
  selectedMonths?: number[] | undefined;
};

export type TSeriesToggleMotion = {
  isAnimationActive: boolean;
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
  martonneYear?: number | undefined;
  activeMonthIndex?: number | null;
  onActiveMonthIndexChange?: (index: number | null) => void;
  isPanel?: boolean;
  syncId?: string;
  footer: ReactNode;
  isStatic?: boolean;
  overlay?: TChartOverlay;
  statsMarkers?: Partial<Record<EStatsBarItem, ReactNode>>;
  annotationBands?: TAnnotationBands;
};

export type TStandardClimateChartFrameProps = Pick<
  TStandardClimateChartProps,
  "isPanel" | "martonneYear" | "altitude" | "statsMarkers" | "footer"
> & {
  summary?: TChartSummary | null | undefined;
  plot?: ReactNode;
};

export type TStandardChartColors = {
  tmax: string;
  tmin: string;
  tavg: string;
  prec: string;
};

export type TStandardSplitSeries = {
  series: TWalterLiethSeriesInput;
  chartData: TMonthlyTemperatureWithAvg[];
  aridity: TMonthAridity[] | null;
};

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
  footer: ReactNode;
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

export type TOverlayEntry = {
  key: string;
  series: TWalterLiethSeries;
  shape: TSeriesShape;
  isShaded: boolean;
  isDimmed?: boolean;
  marker: TSeriesMarkerProps;
};

export type TWalterLiethOverlayProps = {
  entries: readonly TOverlayEntry[];
  domain: TWalterLiethDomain;
  activeMonth: TActiveMonth;
  footer: ReactNode;
};

export type TOverlayLayerArgs = Omit<
  TWalterLiethLayerSeries,
  "colors" | "precDash" | "dotShape"
> & {
  isShaded: boolean;
  shape: TSeriesShape;
};

export type TOverlayTooltipEntry = {
  key: string;
  label: string;
  marker: TSeriesMarkerProps;
  rows: readonly TWalterLiethRow[];
};

export type TOverlayTooltipProps = TWalterLiethTooltipProps & {
  entries: readonly TOverlayTooltipEntry[];
};

export type TFixedYAxesProps = {
  scales: TWalterLiethScales | null;
  rightMax: number;
  rows: readonly Record<string, unknown>[];
};

type TOverlayLayerShared = {
  entries: readonly TStandardChartEntry[];
  visible: TVisibleSeries;
  selectedMonths?: number[] | undefined;
  activeMonthIndex: number | null;
  focusedId: string | null;
  onFocus: (focus: TOverlayFocus | null) => void;
};

export type TOverlayBarsProps = TOverlayLayerShared & {
  isHidden: boolean;
  hasHatch: boolean;
  patternPrefix: string;
};

export type TOverlayCurvesProps = TOverlayLayerShared & {
  lines: readonly TStandardChartLine[];
  hidden: Record<TStandardChartLine["variable"], boolean>;
  offsets: Readonly<Record<string, number>>;
};

export type TMonthTapLayerProps = {
  activeMonthIndex: number | null;
  onActiveMonthIndexChange?: ((index: number | null) => void) | undefined;
  inset: number;
  canScrub: boolean;
  monthCount?: number;
};

export type TMonthGesture = {
  x: number;
  y: number;
  isScrubbing: boolean;
};
