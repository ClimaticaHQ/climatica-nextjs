import type {
  TChartSummary,
  TPanelHeaderSlots,
  TStatDeltas,
  TWalterLiethSeriesInput,
} from "@/types";

/** Name, period and stats cells above a diagram — either chart type, single or split panel. */
export type TSeriesPanelHeaderProps = {
  /** an incomplete series (standard split only — WL shows a notice) gets no stats */
  series: TWalterLiethSeriesInput;
  summary: TChartSummary | null;
  isCompact: boolean;
  showTitle: boolean;
  isPanel: boolean;
  deltas?: TStatDeltas | undefined;
  slots?: TPanelHeaderSlots | undefined;
};

/** One panel of a split pair: the compact header with its name and series dot. */
export type TSplitPanelHeaderProps = Pick<
  TSeriesPanelHeaderProps,
  "series" | "summary" | "deltas" | "slots"
>;
