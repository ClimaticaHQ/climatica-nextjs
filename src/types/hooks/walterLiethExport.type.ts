import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode } from "@/types";
import type { TBuildComparisonSeriesArgs } from "@/components/TempPrecipChart/TempPrecipChart.type";

export type TUseComparisonExportArgs = TBuildComparisonSeriesArgs & {
  /** a two-series comparison (not compare-periods' multi-year Weather chart) */
  isEnabled: boolean;
  chartMode: TChartMode;
  layout: ECompareLayout;
  shading: EWalterLiethShading;
};
