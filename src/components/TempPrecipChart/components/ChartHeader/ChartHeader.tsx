import { ChartCardHeader } from "@/components/ChartCardHeader";
import type { TChartHeaderProps } from "../../TempPrecipChart.type";
import { ChartSwitches } from "../ChartSwitches";
import { ChartTitle } from "../ChartTitle";

/** The chart card's header: chart type, location(s) and subtitle, then the type / layout switches. */
export function ChartHeader({
  chartProps,
  chartMode,
  isWalterLieth,
  canUseWalterLieth,
  isCompare,
  layout,
  subtitleText,
}: TChartHeaderProps) {
  const { cityName, compareMode, labelA, labelB } = chartProps;

  return (
    <ChartCardHeader
      // * always the whole block — chart type, place(s), dataset and period; only the name
      // * itself is left out when a page has none
      title={
        <ChartTitle
          names={compareMode === "cities" && labelA && labelB ? [labelA, labelB] : [cityName ?? ""]}
          // eyebrow={isWalterLieth ? t("chart.modeWalterLieth") : t("chart.modeStandard")}
          subtitleText={subtitleText}
          selectedMonths={chartProps.selectedMonths}
          showMonthBadge={!isWalterLieth && !isCompare}
        />
      }
      controls={
        <ChartSwitches
          chartMode={chartMode}
          onChartModeChange={(mode) => chartProps.onChartModeChange?.(mode)}
          canUseWalterLieth={canUseWalterLieth}
          layout={isCompare ? layout : undefined}
          onLayoutChange={(next) => chartProps.onLayoutChange?.(next)}
        />
      }
    />
  );
}
