import type {
  ECompareLayout,
  EChartBlock,
  EDifferenceMeaning,
  ESortOrder,
  EWalterLiethShading,
} from "@/enums";
import type { ExportMenuProps } from "@/components/UI";
import type {
  TChartMode,
  TDataUpdateInput,
  TPair,
  TPanelExpansion,
  TVariable,
  TVisibleSeries,
} from "@/types";
import type { RefObject } from "react";
import type { TChartModel } from "./chartModel.type";
import type { TDataState } from "./dataState.type";
import type { TChartSeries } from "./series.type";

/** A value the page holds (in the URL) and the chart changes. */
export type TControlled<T> = {
  value: T;
  onChange: (value: T) => void;
};

/** The chart's view state, from the URL. Absent parts are not offered. */
export type TChartViewState = {
  mode: TChartMode;
  /** absent: one panel, no layout switch */
  layout?: TControlled<ECompareLayout> | undefined;
  /** Walter-Lieth overlay: the hatched series */
  shading?: TControlled<EWalterLiethShading> | undefined;
  /** absent: split panels don't expand */
  expansion?: TPanelExpansion | undefined;
  /** split: the two series side by side, by id — absent: the first two */
  pair?: TControlled<TPair<string>> | undefined;
  /** overlay with series chips: the series drawn, by id — absent: all */
  shown?: TControlled<readonly string[]> | undefined;
  /** the variable filter — the variable chips start from it */
  variables: readonly TVariable[];
  /** the month filter; null: every month */
  selectedMonths: number[] | null;
};

/** The chart title's text the page knows. */
export type TChartTitle = {
  /** used when the series kind's titleSource is PAGE */
  names: readonly string[];
  /** the dataset / period line */
  subtitle: string | null;
};

/** What a page enables. New chart blocks are on by default; a page opts out here. */
export type TChartFeatures = {
  title: TChartTitle;
  /** the stats table's difference column: minuend − the other series, and what it compares */
  difference: { minuendId: string; meaning: EDifferenceMeaning } | null;
  /** split: each panel picks its series (more series than panels) */
  hasSidePickers: boolean;
  /** standard chart: the month filter's badge in the title */
  hasMonthBadge: boolean;
  /** the export menu's raw CSV / JSON of every variable (offered where the data has them) */
  hasRawExport: boolean;
  /** chart blocks this page leaves out */
  hiddenBlocks: readonly EChartBlock[];
  /** the page lists its series by year: the stats table's corner toggles the order */
  seriesSort?: TSeriesSort | undefined;
};

/** A page's list order and its toggle (Compare Periods). */
export type TSeriesSort = {
  order: ESortOrder;
  onToggle: () => void;
};

/** The data updates a page's results flash and announce. */
export type TPageUpdate = TDataUpdateInput & {
  isFetching: boolean;
};

/**
 * What every chart page's hook returns. A new required field fails the build on every page
 * that doesn't provide it.
 */
export type TChartPageResult<TSummary, TDetails> = {
  series: readonly TChartSeries[];
  /** derived from the series once: the chart card and the export draw from it */
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  /** the page's results as a whole */
  state: TDataState;
  update: TPageUpdate;
  /** the results' frame — a picked city scrolls here */
  resultsRef: RefObject<HTMLDivElement | null>;
  exportMenu: ExportMenuProps;
  /** the chart's variable chips — the export follows them */
  onVisibleChange: (visible: TVisibleSeries) => void;
  /** page-specific blocks before and after the chart (stat cards, difference cards) */
  summary: TSummary;
  details: TDetails;
};
