import type { TChartSummary, TPanelHeaderSlots, TWalterLiethSeriesInput } from "@/types";

export type TSeriesPanelHeaderProps = {
  series: TWalterLiethSeriesInput;
  summary: TChartSummary | null;
  isPending?: boolean;
};

export type TSplitPanelHeaderProps = {
  series: TWalterLiethSeriesInput;
  slots?: TPanelHeaderSlots | undefined;
};
