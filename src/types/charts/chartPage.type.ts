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

export type TControlled<T> = {
  value: T;
  onChange: (value: T) => void;
};

export type TChartViewState = {
  mode: TChartMode;
  layout?: TControlled<ECompareLayout> | undefined;
  shading?: TControlled<EWalterLiethShading> | undefined;
  expansion?: TPanelExpansion | undefined;
  pair?: TControlled<TPair<string>> | undefined;
  shown?: TControlled<readonly string[]> | undefined;
  variables: readonly TVariable[];
  selectedMonths: number[] | null;
};

export type TChartTitle = {
  names: readonly string[];
  subtitle: string | null;
};

/** new chart blocks are on by default; a page opts out here */
export type TChartFeatures = {
  title: TChartTitle;
  difference: { minuendId: string; meaning: EDifferenceMeaning } | null;
  hasSidePickers: boolean;
  hasMonthBadge: boolean;
  hasRawExport: boolean;
  hiddenBlocks: readonly EChartBlock[];
  seriesSort?: TSeriesSort | undefined;
};

export type TSeriesSort = {
  order: ESortOrder;
  onToggle: () => void;
};

export type TPageUpdate = TDataUpdateInput & {
  isFetching: boolean;
};

/** a new required field fails the build on every page that doesn't provide it */
export type TChartPageResult<TSummary, TDetails> = {
  series: readonly TChartSeries[];
  model: TChartModel;
  viewState: TChartViewState;
  features: TChartFeatures;
  state: TDataState;
  update: TPageUpdate;
  resultsRef: RefObject<HTMLDivElement | null>;
  exportMenu: ExportMenuProps;
  onVisibleChange: (visible: TVisibleSeries) => void;
  summary: TSummary;
  details: TDetails;
};
