import { computeAridityPeriods, withMonthlyMean } from "@/utils";
import { STANDARD_CHART_SINGLE_COLORS } from "../../../charts/StandardClimateChart/StandardClimateChart.constant";
import { StandardPanel } from "../../StandardSplitView/components";
import type { TStandardYearPanelProps } from "../YearsBody.type";
import { findYearSeries } from "../YearsBody.util";

/**
 * One year as a standard chart in its panel — the single-city palette (the header names the
 * year), on the scales every year shares.
 */
export function StandardYearPanel({ context, year, name }: TStandardYearPanelProps) {
  const { chart, chartProps, seriesYears, visible, syncId, activeMonth } = context;
  const series = findYearSeries(seriesYears, year);
  const rows = chartProps.multiPeriodData?.find((period) => period.year === year)?.rows ?? [];
  if (series === undefined) return null;

  return (
    <StandardPanel
      panel={{
        series,
        chartData: withMonthlyMean(rows),
        aridity: computeAridityPeriods(rows),
        colors: STANDARD_CHART_SINGLE_COLORS,
      }}
      headerSlots={name === undefined ? {} : { name }}
      scales={chart.scales}
      rightMax={chart.rightMax}
      visible={visible}
      selectedMonths={chartProps.selectedMonths}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={(index) => activeMonth.onActiveMonthIndexChange?.(index)}
      syncId={syncId}
    />
  );
}
