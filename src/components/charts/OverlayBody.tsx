import { ChartBlocks } from "./ChartBlocks";
import { BLOCK_PLACEMENTS } from "./charts.constant";
import type { TChartBodyProps } from "./charts.type";
import { getDrawnSeries } from "@/utils";
import { getBlockContext } from "./charts.util";
import { OverlayChart } from "./OverlayChart";

/**
 * Every drawn series in one chart, its blocks under it. A series chip hovered in the toolbar
 * (kinds with series chips) highlights its series.
 */
export function OverlayBody(props: TChartBodyProps) {
  const { model, viewState, features, highlightedId } = props;
  const drawn = getDrawnSeries(model, viewState);
  // * a highlight only means something for a series that's drawn
  const highlighted = drawn.some(({ series }) => series.id === highlightedId)
    ? highlightedId
    : null;

  return (
    <OverlayChart
      {...props}
      drawn={drawn}
      highlightedId={highlighted}
      footer={
        <ChartBlocks
          context={getBlockContext(props, { entries: drawn, isCompact: false, shownPanel: null })}
          placements={BLOCK_PLACEMENTS.ONE_PANEL}
          hiddenBlocks={features.hiddenBlocks}
        />
      }
    />
  );
}
