import { CHART_CARD_HEADER_CLASSES as C } from "./ChartCardHeader.constant";
import type { TChartCardHeaderProps } from "./ChartCardHeader.type";

/**
 * A chart card's header: title left, controls right — or the controls under the title as one
 * row when the card is too narrow for both (a container query, so it follows the card).
 */
export function ChartCardHeader({ title, controls }: TChartCardHeaderProps) {
  return (
    <div className={C.CONTAINER}>
      <div className={C.ROW}>
        <div className={C.TITLE}>{title}</div>
        <div className={C.CONTROLS}>{controls}</div>
      </div>
    </div>
  );
}
