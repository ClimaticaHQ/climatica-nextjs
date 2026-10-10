import { CompareChart, MultiPeriodChart } from "@/components/TempPrecipChart/charts";
import { buildCompareData, buildMultiPeriodChartData } from "@/components/TempPrecipChart/utils";
import { OverlayView } from "@/components/WalterLiethComparison/components";
import type { TChartSeries } from "@/types";
import { isCompleteSeries } from "@/utils";
import type { TOverlayChartProps } from "./charts.type";
import { getIdentityColor, getIdentityShape, getShadedId } from "./charts.util";

/**
 * The overlay's chart: one Walter-Lieth diagram, or the standard chart. Until the standard
 * charts are merged, series with chips draw in the years chart, the others in the pair chart.
 */
export function OverlayChart({
  model,
  rule,
  viewState,
  visible,
  activeMonth,
  drawn,
  highlightedId,
  footer,
}: TOverlayChartProps) {
  const months = viewState.selectedMonths;
  const selectedMonths = months !== null && months.length > 0 ? { selectedMonths: months } : {};

  if (viewState.mode === "walter-lieth") {
    const shadedId = getShadedId(model, rule, viewState.shading?.value);
    return (
      <OverlayView
        entries={drawn.flatMap((entry) =>
          isCompleteSeries(entry.walterLieth)
            ? [
                {
                  key: entry.series.id,
                  series: entry.walterLieth,
                  color: getIdentityColor(entry, rule),
                  shape: getIdentityShape(entry, rule),
                  isShaded: entry.series.id === shadedId,
                  isDimmed: highlightedId !== null && highlightedId !== entry.series.id,
                },
              ]
            : [],
        )}
        domain={model.domain}
        activeMonth={activeMonth}
        footer={footer}
      />
    );
  }

  if (rule.hasSeriesChips) {
    const yearOf = (series: TChartSeries) => series.year ?? Number(series.id);
    // * every series keeps its colour from its place in the list, loaded or not
    const years = model.series.map(({ series }) => yearOf(series));
    const periods = model.series
      .filter(({ hasData }) => hasData)
      .map(({ series }) => ({ year: yearOf(series), rows: [...series.data] }));
    const drawnIds = new Set(drawn.map(({ series }) => series.id));
    return (
      <MultiPeriodChart
        chartData={buildMultiPeriodChartData(periods)}
        multiPeriodData={periods}
        scales={model.scales}
        rightMax={model.rightMax}
        visible={visible}
        years={years}
        hiddenPeriods={model.series.flatMap(({ series }) =>
          drawnIds.has(series.id) ? [] : [yearOf(series)],
        )}
        highlightedYear={
          model.series.find(({ series }) => series.id === highlightedId)?.series.year ?? null
        }
        {...selectedMonths}
        footer={footer}
      />
    );
  }

  const [first, second] = model.series;
  return (
    <CompareChart
      chartData={buildCompareData(
        [...(first?.series.data ?? [])],
        [...(second?.series.data ?? [])],
      )}
      scales={model.scales}
      rightMax={model.rightMax}
      visible={visible}
      showAridity={false}
      aridityA={first?.aridity ?? null}
      {...(first ? { labelA: first.series.label } : {})}
      {...(second ? { labelB: second.series.label } : {})}
      activeMonthIndex={activeMonth.activeMonthIndex}
      onActiveMonthIndexChange={activeMonth.onActiveMonthIndexChange}
      {...selectedMonths}
      footer={footer}
    />
  );
}
