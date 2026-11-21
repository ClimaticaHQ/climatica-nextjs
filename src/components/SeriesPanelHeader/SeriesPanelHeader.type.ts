import type { TChartSummary, TPanelHeaderSlots, TWalterLiethSeriesInput } from "@/types";

/** The single diagram's stats bar above the plot. */
export type TSeriesPanelHeaderProps = {
  series: TWalterLiethSeriesInput;
  summary: TChartSummary | null;
  /** the data are still loading: the stats bar with placeholders for its values */
  isPending?: boolean;
};

/** One panel of a split pair: marker, name, subtitle, and the container's controls. */
export type TSplitPanelHeaderProps = {
  series: TWalterLiethSeriesInput;
  slots?: TPanelHeaderSlots | undefined;
};
