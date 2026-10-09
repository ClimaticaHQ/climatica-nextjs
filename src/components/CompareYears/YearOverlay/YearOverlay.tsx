"use client";

import { useState } from "react";
import { YearChips } from "../YearChips";
import { YEAR_OVERLAY_CLASSES as C } from "./YearOverlay.constant";
import type { TYearOverlayProps } from "./YearOverlay.type";

/**
 * Compared years overlaid in one diagram, whichever chart type: the year chips above it, the
 * chart's own chips (if any) beside them from `sm`, below them on phones.
 */
export function YearOverlay({
  years,
  shown,
  onShownChange,
  controls,
  renderDiagram,
}: TYearOverlayProps) {
  const [highlighted, setHighlighted] = useState<number | null>(null);
  // * a highlight only means something for a year that's drawn
  const shownHighlight = highlighted !== null && shown.includes(highlighted) ? highlighted : null;

  return (
    <div className={C.ROOT}>
      {/* * DOM order = visual order at every width: years, the chart's chips, the diagram */}
      <div className={C.YEARS}>
        <YearChips
          years={years}
          shown={shown}
          onShownChange={onShownChange}
          onHighlight={setHighlighted}
        />
      </div>
      {controls !== undefined && <div className={C.CONTROLS}>{controls}</div>}
      <div className={C.DIAGRAM}>{renderDiagram(shownHighlight)}</div>
    </div>
  );
}
