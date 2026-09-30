import { CHART_CONTROLS_ROW_CLASSES as C } from "./ChartControlsRow.constant";
import type { TChartControlsRowProps } from "./ChartControlsRow.type";

/** The chart card's secondary controls, right-aligned below the header, at a fixed height. */
export function ChartControlsRow({ isStacked, children }: TChartControlsRowProps) {
  return (
    <div data-chart-controls className={isStacked ? C.STACKED : C.ROW}>
      {children}
    </div>
  );
}
