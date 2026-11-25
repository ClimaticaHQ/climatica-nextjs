import { ChartBlocks } from "./ChartBlocks";
import { BLOCK_PLACEMENTS } from "./charts.constant";
import type { TChartBodyProps } from "./charts.type";
import { getDrawnSeries } from "@/utils";
import { getBlockContext } from "./charts.util";
import { OverlayChart } from "./OverlayChart";

export function OverlayBody(props: TChartBodyProps) {
  const { model, viewState, features, highlightedId } = props;
  const drawn = getDrawnSeries(model, viewState);
  const highlighted = drawn.some(({ series }) => series.id === highlightedId)
    ? highlightedId
    : null;

  const footer = (
    <ChartBlocks
      context={getBlockContext(props, { entries: drawn, isCompact: false, shownPanel: null })}
      placements={BLOCK_PLACEMENTS.ONE_PANEL}
      hiddenBlocks={features.hiddenBlocks}
    />
  );

  return <OverlayChart {...props} drawn={drawn} highlightedId={highlighted} footer={footer} />;
}
