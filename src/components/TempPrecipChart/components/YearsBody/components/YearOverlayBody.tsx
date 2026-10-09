import { OverlayView } from "@/components/WalterLiethComparison/components";
import { getSharedDomain, isCompleteSeries } from "@/utils";
import { MultiPeriodChart } from "../../../charts";
import type { TYearOverlayBodyProps } from "../YearsBody.type";

/**
 * Overlay: the shown years in one diagram — the Climate A / B overlay for Walter-Lieth (dots in
 * the year colours, no hatching), the multi-period chart otherwise. Both keep the scales of every
 * compared year, so toggling a year never rescales the plot.
 */
export function YearOverlayBody({ context, shown, highlighted }: TYearOverlayBodyProps) {
  const { chart, chartProps, seriesYears, years, visible, isWalterLieth, activeMonth } = context;

  if (!isWalterLieth) {
    return (
      <MultiPeriodChart
        chartData={chart.chartData}
        multiPeriodData={chartProps.multiPeriodData ?? []}
        scales={chart.scales}
        rightMax={chart.rightMax}
        visible={visible}
        {...(chartProps.selectedMonths !== undefined
          ? { selectedMonths: chartProps.selectedMonths }
          : {})}
        years={chartProps.comparedYears ?? years.map(({ year }) => year)}
        hiddenPeriods={years.flatMap(({ year }) => (shown.includes(year) ? [] : [year]))}
        highlightedYear={highlighted}
      />
    );
  }

  const complete = seriesYears.filter(isCompleteSeries);
  return (
    <OverlayView
      entries={complete.flatMap((series) =>
        series.singleYear !== undefined &&
        series.markerColor !== undefined &&
        shown.includes(series.singleYear)
          ? [
              {
                key: String(series.singleYear),
                series,
                color: series.markerColor,
                shape: "circle",
                isShaded: false,
                isDimmed: highlighted !== null && highlighted !== series.singleYear,
              },
            ]
          : [],
      )}
      domain={getSharedDomain(complete)}
      activeMonth={activeMonth}
      // * the year chips above name the years — the legend keeps line and bar styles only
      shouldListSeries={false}
    />
  );
}
