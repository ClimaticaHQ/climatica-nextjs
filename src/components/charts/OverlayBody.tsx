"use client";

import { VariableChips } from "./VariableChips";
import { useState } from "react";
import { ChartBlocks } from "./ChartBlocks";
import { BLOCK_PLACEMENTS, OVERLAY_CHIPS_CLASSES as C } from "./charts.constant";
import type { TChartBodyProps } from "./charts.type";
import { getDrawnSeries } from "@/utils";
import { getBlockContext } from "./charts.util";
import { OverlayChart } from "./OverlayChart";
import { SeriesChips } from "./SeriesChips";

/**
 * Every drawn series in one chart, its blocks under it. Kinds with series chips put them above
 * the chart (with the variable chips in the standard chart): they toggle and highlight series.
 */
export function OverlayBody(props: TChartBodyProps) {
  const { model, rule, viewState, features, visible, onVisibleChange } = props;
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const drawn = getDrawnSeries(model, viewState);
  // * a highlight only means something for a series that's drawn
  const highlighted = drawn.some(({ series }) => series.id === highlightedId)
    ? highlightedId
    : null;

  const chart = (
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

  const shown = viewState.shown;
  if (!rule.hasSeriesChips || shown === undefined) return chart;

  return (
    <div className={C.ROOT}>
      <div className={C.YEARS}>
        <SeriesChips
          entries={model.series}
          shown={shown.value}
          onShownChange={shown.onChange}
          onHighlight={setHighlightedId}
        />
      </div>
      {viewState.mode === "standard" && (
        <div className={C.CONTROLS}>
          <VariableChips
            visible={visible}
            variables={viewState.variables}
            onChange={onVisibleChange}
            isScrollRow
          />
        </div>
      )}
      <div className={C.DIAGRAM}>{chart}</div>
    </div>
  );
}
