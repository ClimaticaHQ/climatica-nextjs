import type { ECompareLayout, EWalterLiethSeriesId } from "@/enums";
import type { TChartMode, TExpandedPanel } from "../components/chart";
import type { TWalterLiethSeriesInput } from "./walterLieth.type";

/** Which panels can be expanded — those with a header (an incomplete WL series has none). */
export type TExpandablePanels = Record<EWalterLiethSeriesId, boolean>;

export type TExportedPanelArgs = {
  chartMode: TChartMode;
  layout: ECompareLayout;
  expanded: TExpandedPanel;
  seriesA: TWalterLiethSeriesInput;
  seriesB: TWalterLiethSeriesInput;
};

export type TExportedSeriesLabelsArgs = {
  /** the panel the export shows alone; null = both */
  expanded: TExpandedPanel;
  labelA: string;
  labelB: string;
};
