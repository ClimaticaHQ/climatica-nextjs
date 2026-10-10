import { CHART_CARD_HEADER_CLASSES as C } from "@/components/ChartCardHeader/ChartCardHeader.constant";
import { ChartSwitches, ChartTitle } from "@/components/TempPrecipChart/components";
import type { TChartCardHeaderProps } from "./charts.type";

/**
 * The card's header: the title block left, the chart type and layout switches right — or under
 * the title when the card is too narrow for both (a container query, so it follows the card).
 */
export function ChartCardHeader({
  names,
  subtitle,
  mode,
  selectedMonths,
  hasMonthBadge,
  viewState,
}: TChartCardHeaderProps) {
  const layout = viewState.layout;

  return (
    <div className={C.CONTAINER}>
      <div className={C.ROW}>
        <div className={C.TITLE}>
          <ChartTitle
            names={names}
            subtitleText={subtitle}
            selectedMonths={selectedMonths ?? undefined}
            showMonthBadge={mode === "standard" && hasMonthBadge}
          />
        </div>
        <div className={C.CONTROLS}>
          <ChartSwitches
            chartMode={mode}
            layout={layout?.value}
            onLayoutChange={(next) => layout?.onChange(next)}
          />
        </div>
      </div>
    </div>
  );
}
