import { CHART_CONTROLS_ROW_CLASSES as C } from "./ChartControlsRow.constant";
import type { TChartControlsNoteProps, TChartControlsRowProps } from "./ChartControlsRow.type";

/** The chart card's secondary controls, left-aligned below the header, at a fixed height. */
export function ChartControlsRow({ children }: TChartControlsRowProps) {
  return (
    <div data-chart-controls className={C.ROW}>
      {children}
    </div>
  );
}

/** A muted note in the controls row — where a chart type has nothing to switch. */
export function ChartControlsNote({ text }: TChartControlsNoteProps) {
  return <p className={`m-0 ${C.NOTE}`}>{text}</p>;
}
