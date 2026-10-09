"use client";

import { ChartLegend } from "@/components/ChartLegend";
import { YearPairView } from "@/components/CompareYears/YearPairView";
import { useLegendLabels } from "@/hooks/ui/useLegendLabels";
import { useWalterLiethLegendItems } from "@/hooks/ui/useWalterLiethLegendItems";
import { getSharedDomain, getStandardLegendItems, isCompleteSeries } from "@/utils";
import { STANDARD_CHART_SINGLE_COLORS } from "../../../charts/StandardClimateChart/StandardClimateChart.constant";
import type { TYearPairBodyProps } from "../YearsBody.type";
import { findYearSeries } from "../YearsBody.util";
import { StandardYearPanel } from "./StandardYearPanel";
import { WalterLiethYearPanel } from "./WalterLiethYearPanel";

/** Side by side: the pair's two years, each a Walter-Lieth diagram or a standard chart. */
export function YearPairBody({ context, pair }: TYearPairBodyProps) {
  const legendLabels = useLegendLabels();
  const walterLiethLegend = useWalterLiethLegendItems();
  const { years, seriesYears, isWalterLieth, visible, syncId, activeMonth } = context;
  const pairSeries = pair.map((year) => findYearSeries(seriesYears, year));
  const domain = getSharedDomain(
    pairSeries.filter((s) => s !== undefined).filter(isCompleteSeries),
  );

  return (
    <YearPairView
      years={years}
      pair={pair}
      onPairChange={context.chartProps.years?.onPairChange}
      renderPanel={(year, name) => {
        const series = findYearSeries(seriesYears, year);
        if (!isWalterLieth) return <StandardYearPanel context={context} year={year} name={name} />;
        return series === undefined ? null : (
          <WalterLiethYearPanel
            series={series}
            domain={domain}
            syncId={syncId}
            activeMonth={activeMonth}
            name={name}
          />
        );
      }}
      legend={
        <ChartLegend
          items={
            isWalterLieth
              ? walterLiethLegend
              : getStandardLegendItems({
                  labels: legendLabels,
                  colors: STANDARD_CHART_SINGLE_COLORS,
                  visible,
                  aridity: null,
                })
          }
        />
      }
    />
  );
}
