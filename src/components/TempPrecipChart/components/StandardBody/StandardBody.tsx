import { MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { WALTER_LIETH_COLORS } from "@/constants";
import { CompareChart, MultiPeriodChart, StandardClimateChart } from "../../charts";
import { CHART_COLORS } from "../../TempPrecipChart.constant";
import type { TStandardBodyProps } from "../../TempPrecipChart.type";
import { StandardSplitView } from "../StandardSplitView";

/** Standard mode: multi-period, split panels or the overlay chart, or the single-city chart. */
export function StandardBody({
  chartProps,
  chart,
  comparison,
  visible,
  isSplit,
  syncId,
  expansion,
}: TStandardBodyProps) {
  const { selectedMonths, labelA, labelB, altitude } = chartProps;
  const months = selectedMonths !== undefined ? { selectedMonths } : {};
  const showAridity = chartProps.showAridity !== false;
  const shared = { scales: chart.scales, rightMax: chart.rightMax, visible };

  if (chart.isMultiPeriod) {
    return (
      <MultiPeriodChart
        chartData={chart.chartData}
        multiPeriodData={chartProps.multiPeriodData ?? []}
        {...shared}
        {...months}
        {...(chartProps.periodColors !== undefined
          ? { periodColors: chartProps.periodColors }
          : {})}
        {...(chartProps.hiddenPeriods !== undefined
          ? { hiddenPeriods: chartProps.hiddenPeriods }
          : {})}
      />
    );
  }
  if (isSplit) {
    return (
      <StandardSplitView
        seriesA={{
          series: comparison.seriesA,
          chartData: chart.chartDataA,
          aridity: chart.aridityA,
          colors: CHART_COLORS.compareA,
        }}
        seriesB={{
          series: comparison.seriesB,
          chartData: chart.chartDataB,
          aridity: chart.aridityB,
          colors: CHART_COLORS.compareB,
        }}
        {...shared}
        selectedMonths={selectedMonths}
        activeMonthIndex={chart.activeMonthIndex}
        onActiveMonthIndexChange={chart.setActiveMonthIndex}
        syncId={syncId}
        expansion={expansion}
      />
    );
  }
  if (chart.isCompare) {
    return (
      <CompareChart
        chartData={chart.chartData}
        {...shared}
        showAridity={showAridity}
        aridityA={chart.aridityA}
        {...(labelA !== undefined ? { labelA } : {})}
        {...(labelB !== undefined ? { labelB } : {})}
        {...months}
        activeMonthIndex={chart.activeMonthIndex}
        onActiveMonthIndexChange={chart.setActiveMonthIndex}
        strip={
          <MonthlyValuesTable
            series={[
              { series: comparison.seriesA, data: chart.chartDataA },
              { series: comparison.seriesB, data: chart.chartDataB },
            ].map(({ series, data }) => ({
              key: series.id,
              label: series.label,
              color: WALTER_LIETH_COLORS.SERIES[series.id],
              data,
            }))}
            isCompact={false}
            activeMonthIndex={chart.activeMonthIndex}
            onActiveMonthIndexChange={chart.setActiveMonthIndex}
          />
        }
      />
    );
  }
  return (
    <StandardClimateChart
      name={chartProps.cityName ?? ""}
      chartData={chart.chartDataSingle}
      aridity={chart.aridity}
      summary={chart.summary}
      {...shared}
      showAridity={showAridity}
      activeMonthIndex={chart.activeMonthIndex}
      onActiveMonthIndexChange={chart.setActiveMonthIndex}
      {...months}
      {...(altitude !== undefined ? { altitude } : {})}
    />
  );
}
