import type { ECompareLayout, EWalterLiethShading } from "@/enums";
import type { TChartMode, TComparisonTable, TExpandedPanel, TVisibleSeries } from "@/types";
import type {
  TBuildComparisonSeriesArgs,
  TBuildYearSeriesArgs,
} from "@/components/TempPrecipChart/TempPrecipChart.type";

export type TUseWeatherYearsExportArgs = Omit<TBuildYearSeriesArgs, "period"> & {
  /** Compare Periods with weather years */
  isEnabled: boolean;
  chartMode: TChartMode;
  layout: ECompareLayout;
  /** the years the screen draws: the side-by-side pair, or the overlay's shown years */
  drawn: readonly number[];
};

export type TUseComparisonExportArgs = TBuildComparisonSeriesArgs & {
  /** a two-series comparison (not compare-periods' multi-year Weather chart) */
  isEnabled: boolean;
  chartMode: TChartMode;
  layout: ECompareLayout;
  shading: EWalterLiethShading;
  /** the split's expanded panel as the page holds it — the export follows what is shown */
  expanded: TExpandedPanel;
  /** the page's comparison table (null without both series' data) */
  table: TComparisonTable | null;
  /** the standard chart's chips — the strips' rows */
  visible: TVisibleSeries;
};
