import type { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type { TChartMode, TExpandedPanel } from "../components/chart";
import type { TWalterLiethSeriesInput } from "./walterLieth.type";

export type TExpandablePanels = Record<EWalterLiethSeriesId, boolean>;

export type TExportedPanelArgs = {
  chartMode: TChartMode;
  layout: ECompareLayout;
  expanded: TExpandedPanel;
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
};

export type TExportedSeriesLabelsArgs = {
  expanded: TExpandedPanel;
  labelA: string;
  labelB: string;
};
