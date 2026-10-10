import { MONTHLY_VALUES_TEXT_COLOR, MonthlyValuesTable } from "@/components/MonthlyValuesTable";
import { EChartBody } from "@/enums";
import type { TChartBlockProps } from "./charts.type";
import { getIdentityColor } from "./charts.util";

/**
 * The monthly mean temperature and precipitation under a chart: one row per series. In an
 * overlay each row takes its series' colour; under one series the text colour.
 */
export function ValuesTableBlock({ context }: TChartBlockProps) {
  const { entries, body, rule, isCompact, activeMonth } = context;
  const isOverlay = body === EChartBody.OVERLAY;

  return (
    <MonthlyValuesTable
      series={entries.map((entry) => ({
        key: entry.series.id,
        label: entry.series.label,
        color: isOverlay ? getIdentityColor(entry, rule) : MONTHLY_VALUES_TEXT_COLOR,
        data: entry.chartData,
      }))}
      isCompact={isCompact}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
    />
  );
}
