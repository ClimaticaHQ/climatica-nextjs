import { CHART_TOOLBAR_CLASSES as C } from "./charts.constant";
import type { TChartToolbarProps } from "./charts.type";

export function ChartToolbar({ chips, controls, isStacked }: TChartToolbarProps) {
  return (
    <div
      data-chart-controls
      className={chips !== undefined ? `${C.ROW} ${C.ROW_WITH_CHIPS}` : C.ROW}
    >
      {chips !== undefined && (
        <div data-toolbar-chips className={C.CHIPS}>
          {chips}
        </div>
      )}
      <div data-toolbar-controls className={isStacked ? C.CONTROLS_STACKED : C.CONTROLS}>
        {controls}
      </div>
    </div>
  );
}
