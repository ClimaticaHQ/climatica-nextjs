import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type {
  TChartMode,
  TChartSubtitle,
  TCompareMode,
  TMonthLabelFormat,
  TMonthlyTemperature,
  TMonthlyTemperatureWithAvg,
  TMultiPeriodEntry,
  TPanelExpansion,
  TUpdateFlashKeys,
  TVariable,
  TVisibleSeries,
  TWalterLiethScales,
  TWalterLiethSeriesInput,
  TYearsViewState,
} from "@/types";
import type { useTempPrecipChart } from "./hooks/useTempPrecipChart";

export type TTempPrecipChartProps = {
  data?: TMonthlyTemperature[];
  cityName?: string;
  subtitle?: TChartSubtitle;
  altitude?: number;
  selectedMonths?: number[];
  dataA?: TMonthlyTemperature[];
  dataB?: TMonthlyTemperature[];
  labelA?: string;
  labelB?: string;
  compareMode?: TCompareMode;
  showAridity?: boolean;
  variables?: readonly TVariable[];
  multiPeriodData?: TMultiPeriodEntry[] | undefined;
  /** Compare Periods with weather years: every compared year, in order — their colours */
  comparedYears?: readonly number[] | undefined;
  onVisibleSeriesChange?: (visible: TVisibleSeries) => void;
  /** controlled by the page (URL state); Walter-Lieth (the default) when omitted */
  chartMode?: TChartMode;
  /** Compare Periods with weather years: the years each layout draws (URL state) */
  years?: TYearsViewState;
  /** compare pages only: per-series altitude for the WL headers (cities) */
  altitudeA?: number;
  altitudeB?: number;
  /** compare pages only: split or overlay, for both chart types, persisted in URL state */
  layout?: ECompareLayout;
  onLayoutChange?: (layout: ECompareLayout) => void;
  /** compare pages only: which series the overlay hatches, persisted in URL state */
  wlShading?: EWalterLiethShading;
  onWlShadingChange?: (shading: EWalterLiethShading) => void;
  /** compare split: the panel shown across the card (URL state) */
  panelExpansion?: TPanelExpansion;
  /** the series whose updates flash the card outside the split layout — every series by default */
  flashKeys?: TUpdateFlashKeys;
};

export type TBuildYearSeriesArgs = {
  periods: readonly TMultiPeriodEntry[];
  /** every compared year, loaded or not — each year's colour comes from its place here */
  years: readonly number[];
  /** each panel's subtitle, e.g. "Weather · single year" */
  period: string;
  altitude?: number | undefined;
};

export type TBuildComparisonSeriesArgs = {
  chartDataA: readonly TMonthlyTemperatureWithAvg[];
  chartDataB: readonly TMonthlyTemperatureWithAvg[];
  labelA: string;
  labelB: string;
  compareMode: TCompareMode | undefined;
  /** city (periods) — the line under each period title */
  cityName: string;
  /** dataset/period text (cities) — the line under each city title */
  subtitleText: string;
  altitudeA?: number | undefined;
  altitudeB?: number | undefined;
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

/** Everything useTempPrecipChart derives from the chart's data. */
export type TTempPrecipChartState = ReturnType<typeof useTempPrecipChart>;

export type TComparisonSeries = {
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
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
  /** the store's fetched variables; undefined = all available */
  variables?: readonly TVariable[] | undefined;
  onChange: (visible: TVisibleSeries) => void;
  /** one line scrolling sideways, from the left — under the year chips */
  isScrollRow?: boolean;
};

export type TUseVisibleSeriesArgs = Pick<
  TTempPrecipChartProps,
  "variables" | "onVisibleSeriesChange"
>;

export type TChartHeaderProps = {
  chartProps: TTempPrecipChartProps;
  /** the page's chart type (the toggle's state) */
  chartMode: TChartMode;
  /** the chart type drawn — WL only where it's available */
  isWalterLieth: boolean;
  isCompare: boolean;
  /** Climate A / B and weather years: the side by side / overlay switch */
  hasLayout: boolean;
  layout: ECompareLayout;
  subtitleText: string | null;
};

export type TWalterLiethBodyProps = {
  chart: TTempPrecipChartState;
  seriesSingle: TWalterLiethSeriesInput;
  comparison: TComparisonSeries;
  layout: ECompareLayout;
  shading?: EWalterLiethShading | undefined;
  expansion: TPanelExpansion;
};

export type TSecondaryControlsProps = {
  isWalterLieth: boolean;
  /** WL overlay of two complete series: the shading control */
  isOverlay: boolean;
  comparison: TComparisonSeries;
  shading: EWalterLiethShading;
  onShadingChange: (shading: EWalterLiethShading) => void;
  visible: TVisibleSeries;
  variables?: readonly TVariable[] | undefined;
  onVisibleChange: (visible: TVisibleSeries) => void;
};

export type TStandardBodyProps = {
  chartProps: TTempPrecipChartProps;
  chart: TTempPrecipChartState;
  comparison: TComparisonSeries;
  visible: TVisibleSeries;
  isSplit: boolean;
  syncId: string;
  expansion: TPanelExpansion;
};

export type TUseChartSeriesArgs = {
  chartProps: TTempPrecipChartProps;
  chart: TTempPrecipChartState;
  subtitleText: string | null;
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

/** The chart itself, crossfading between chart types and layouts. */
export type TChartBodyProps = {
  chartProps: TTempPrecipChartProps;
  chart: TTempPrecipChartState;
  seriesSingle: TWalterLiethSeriesInput;
  seriesYears: readonly TWalterLiethSeriesInput[];
  comparison: TComparisonSeries;
  visible: TVisibleSeries;
  onVisibleChange: (visible: TVisibleSeries) => void;
  isWalterLieth: boolean;
  layout: ECompareLayout;
  syncId: string;
  expansion: TPanelExpansion;
};

/** Recharts' series animation, and how long a hidden series stays for it. */
export type TSeriesToggleMotion = {
  isAnimationActive: boolean;
  /** ms — the series leaves the tooltip / legend once its fade-out is done */
  toggleMs: number;
};
