import type { ECompareLayout } from "@/enums";
import type { TChartMode } from "@/types";
import type { TBuildYearSeriesArgs } from "@/components/TempPrecipChart/TempPrecipChart.type";

export type TUseWeatherYearsExportArgs = Omit<TBuildYearSeriesArgs, "period"> & {
  /** Compare Periods with weather years */
  isEnabled: boolean;
  chartMode: TChartMode;
  layout: ECompareLayout;
  /** the years the screen draws: the side-by-side pair, or the overlay's shown years */
  drawn: readonly number[];
};
