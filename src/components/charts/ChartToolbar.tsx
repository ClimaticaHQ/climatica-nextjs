import { CHART_TOOLBAR_CLASSES as C } from "./charts.constant";
import type { TChartToolbarProps } from "./charts.type";

/**
 * The chart card's toolbar, one row in every view: the entity chips on the left, the view's own
 * controls on the right, both centred on the row. The controls keep one height across views, so
 * switching views moves nothing; when the row runs out they wrap below the chips, still on the
 * right. Without chips, the controls alone, on the right.
 */
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
