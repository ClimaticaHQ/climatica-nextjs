import { Card } from "@/components/Card";
import { SPLIT_PANEL_CARD_CLASS, SPLIT_PANEL_ROWS_CLASS } from "@/constants";
import { ECardPadding, ECardSize } from "@/enums";
import { SplitPanelHeader } from "@/components/SeriesPanelHeader";
import { StandardClimateChart } from "./StandardClimateChart";
import type { TStandardPanelProps } from "./charts.type";

/** One standard-chart panel: the WL split's card and header, the standard chart below. */
export function StandardPanel({
  panel,
  headerSlots,
  footer,
  flashKeys,
  ...shared
}: TStandardPanelProps) {
  const { selectedMonths, ...chart } = shared;

  return (
    <Card
      size={ECardSize.SM}
      padding={ECardPadding.PANEL}
      flashKeys={flashKeys ?? [panel.series.id]}
      data-panel-series={panel.series.id}
      className={SPLIT_PANEL_CARD_CLASS}
    >
      <figure className={`m-0 min-w-0 ${SPLIT_PANEL_ROWS_CLASS}`}>
        <SplitPanelHeader series={panel.series} slots={headerSlots} />
        <StandardClimateChart
          chartData={panel.chartData}
          aridity={panel.aridity}
          scales={chart.scales}
          rightMax={chart.rightMax}
          summary={null}
          visible={chart.visible}
          // * series identity colors on the bars — no arid recoloring
          showAridity={false}
          colors={panel.colors}
          isPanel
          syncId={chart.syncId}
          activeMonthIndex={chart.activeMonthIndex}
          onActiveMonthIndexChange={chart.onActiveMonthIndexChange}
          footer={footer}
          {...(selectedMonths !== undefined ? { selectedMonths } : {})}
        />
      </figure>
    </Card>
  );
}
