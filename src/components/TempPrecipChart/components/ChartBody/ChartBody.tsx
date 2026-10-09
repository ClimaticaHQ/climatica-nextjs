import { ChartTransition } from "@/components/ChartTransition";
import { useDataUpdate } from "@/components/DataUpdate";
import { ECompareLayout } from "@/enums";
import type { TChartBodyProps } from "../../TempPrecipChart.type";
import { StandardBody } from "../StandardBody";
import { WalterLiethBody } from "../WalterLiethBody";
import { YearsBody } from "../YearsBody";

/** The chart in the card — crossfading when the chart type, the layout or the data changes. */
export function ChartBody({
  chartProps,
  chart,
  seriesSingle,
  seriesYears,
  comparison,
  visible,
  onVisibleChange,
  isWalterLieth,
  layout,
  syncId,
  expansion,
}: TChartBodyProps) {
  const { update } = useDataUpdate();

  return (
    <ChartTransition
      transitionKey={`${isWalterLieth ? "walter-lieth" : "standard"}-${layout}-${update.id}`}
    >
      {chart.isMultiPeriod ? (
        <YearsBody
          chartProps={chartProps}
          chart={chart}
          seriesYears={seriesYears}
          visible={visible}
          onVisibleChange={onVisibleChange}
          isWalterLieth={isWalterLieth}
          layout={layout}
          syncId={syncId}
        />
      ) : isWalterLieth ? (
        <WalterLiethBody
          chart={chart}
          seriesSingle={seriesSingle}
          comparison={comparison}
          layout={layout}
          shading={chartProps.wlShading}
          expansion={expansion}
        />
      ) : (
        <StandardBody
          chartProps={chartProps}
          chart={chart}
          comparison={comparison}
          visible={visible}
          isSplit={chart.isCompare && layout === ECompareLayout.SPLIT}
          syncId={syncId}
          expansion={expansion}
        />
      )}
    </ChartTransition>
  );
}
